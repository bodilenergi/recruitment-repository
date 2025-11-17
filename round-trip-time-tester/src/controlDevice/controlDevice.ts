import { DeviceState, StorageAdapter } from '@beam/storage';
import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';
import { retrieveFirstMeasurementAfterCommand } from './retrieveFirstMeasurementAfterCommand';
import { retrieveLastMeasurementDuringActivation } from './retrieveLastMeasurementDuringActivation';
import { retrieveLastMeasurementBeforeActivation } from './retrieveLastMeasurementBeforeActivation';
import { sleep, toMilliseconds } from '@src/util';

export const RESPONSE_THRESHOLD_IN_WATTS = 500;

export const turnOnDevicesAndVerifyResponse = async (
  storage: StorageAdapter,
  messageAdapter: DeviceMessageAdapter,
  deviceId: string,
  boostTimeSeconds: number
) => {

  const { meter_id, relay_id, measurement_factor = 1 } = await storage.deviceState.findOne({id: deviceId});

  const isSingleDevice = relay_id === meter_id;

  const meterDataBeforeActivation = await retrieveLastMeasurementBeforeActivation(storage, Date.now(), meter_id);

  if (!meterDataBeforeActivation) {
    throw new Error('Test Error! Power data waiting time crossed the limit.');
  }

  const powerBeforeActivation = meterDataBeforeActivation.power * measurement_factor;

  if (powerBeforeActivation > RESPONSE_THRESHOLD_IN_WATTS) {
    return;
  }

  const messageSentAt = messageAdapter
    .publishDeviceMessage(storage, device, 'on', boostTimeSeconds, isSingleDevice)
    .messageSentAt.getTime();

  const meterDataFromFirstMeasurement = await retrieveFirstMeasurementAfterCommand(storage, messageSentAt, meter_id);

  await sleep(toMilliseconds(boostTimeSeconds + 1, 'seconds'));

  const meterDataFromLastMeasurement = await retrieveLastMeasurementDuringActivation(
    storage,
    messageSentAt,
    boostTimeSeconds * 1000,
    meter_id
  );

  if (!meterDataFromLastMeasurement || !meterDataFromFirstMeasurement) {
    throw new Error('Test Error! Power data waiting time crossed the limit.');
  }

  return { meterDataFromFirstMeasurement, meterDataFromLastMeasurement, messageSentAt };
};
