import { DeviceState, StorageAdapter } from '@src/types';
import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';
import { turnOnDevicesAndVerifyResponse, RESPONSE_THRESHOLD_IN_WATTS } from '@src/controlDevice/controlDevice';
import Fraction from 'fraction.js';

const BOOST_TIME_SECONDS = 5;

const DEFAULT_CHUNK_CAPACITY = 100000;

export const startResponsivenessCheck = async (storage: StorageAdapter, messageAdapter: DeviceMessageAdapter) => {
  const devices = await storage.deviceState.findActive();

  const deviceChunks = chunkDevicesOnCapacity(devices);

  for (const deviceChunk of deviceChunks) {
    await Promise.all(
      deviceChunk.map(async (device: DeviceState) => {
        const capacityIsBeingDelivered = await isCapacityBeingDelivered(storage);

        if (!capacityIsBeingDelivered) {
          checkDeviceResponsiveness(device, storage, messageAdapter);
        }
      })
    );
  }
  return;
};

const isCapacityBeingDelivered = async (storage: StorageAdapter) =>
  (await storage.flexAsset.findMany({ control: true })).length > 0;

export const checkDeviceResponsiveness = async (
  device: DeviceState,
  storage: StorageAdapter,
  messageAdapter: DeviceMessageAdapter
) => {
  const {
    id: deviceId,
    measurement_factor = 1,
    boost_capacity = 0,
    relay_healthy: relayHealthyBeforeCheck,
    meter_healthy: meterHealthyBeforeCheck,
    is_responsive: isResponsiveBeforeCheck,
  } = device;

  const responseOnTurnOn = await turnOnDevicesAndVerifyResponse(storage, messageAdapter, deviceId, BOOST_TIME_SECONDS);

  if (!responseOnTurnOn) {
    return;
  }

  const powerDuringActivation = responseOnTurnOn.meterDataFromLastMeasurement.power * measurement_factor;

  const deviceIsResponsive = powerDuringActivation > RESPONSE_THRESHOLD_IN_WATTS;

  const healthCheckUpdate = {
    is_responsive: deviceIsResponsive,
    ...(deviceIsResponsive && {
      relay_healthy: true,
      meter_healthy: true,
    }),
  };

  await storage.deviceState.update(deviceId, healthCheckUpdate);

  const deviceHealthyBeforeCheck = isResponsiveBeforeCheck && meterHealthyBeforeCheck && relayHealthyBeforeCheck;

  if (deviceIsResponsive && !deviceHealthyBeforeCheck) {
    await storage.eventLog.create({
      device_id: deviceId,
      event_status: 'deviceHealthy',
      meta_data: 'Due to device responsiveness check',
    });
  } else if (!deviceIsResponsive && deviceHealthyBeforeCheck) {
    await storage.eventLog.create({
      device_id: deviceId,
      event_status: 'deviceUnhealthy',
      meta_data: 'Due to device responsiveness check',
    });
  }

  const RESPONSIVENESS_SIGNIFICANCE_DEVIATION = 0.2;

  const hasBoostCapacityDeviatedMoreThan20Percent =
    boost_capacity === 0
      ? powerDuringActivation > 0
      : new Fraction(powerDuringActivation)
          .sub(boost_capacity)
          .abs()
          .div(boost_capacity)
          .compare(RESPONSIVENESS_SIGNIFICANCE_DEVIATION) === 1;

  if (deviceIsResponsive && hasBoostCapacityDeviatedMoreThan20Percent) {
    await storage.eventLog.create({
      device_id: deviceId,
      event_status: 'boostCapacityChange',
      capacity: powerDuringActivation,
      meta_data: `Due to active_power deviation of more than ${
        RESPONSIVENESS_SIGNIFICANCE_DEVIATION * 100
      }% during responsiveness check`,
    });

    await storage.deviceState.update(deviceId, { boost_capacity: powerDuringActivation });
  }
};

export const chunkDevicesOnCapacity = (
  devices: DeviceState[],
  chunkMaxCapacity = DEFAULT_CHUNK_CAPACITY
): DeviceState[][] => {
  const chunks: DeviceState[][] = [];

  let chunk: DeviceState[] = [];
  let chunkCapacity = 0;

  for (const device of devices) {
    const boostCapacity = device.boost_capacity ?? 0;
    if (boostCapacity > chunkMaxCapacity) {
      chunks.push([device]);

      continue;
    }

    if (chunkCapacity + boostCapacity <= chunkMaxCapacity) {
      chunk.push(device);
      chunkCapacity += boostCapacity;
    } else {
      chunks.push(chunk);
      chunk = [device];
      chunkCapacity = boostCapacity;
    }
  }

  if (chunk.length > 0) {
    chunks.push(chunk);
  }

  return chunks;
};
