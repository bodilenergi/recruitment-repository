import { getMeterPhasesCurrent, isAllPhasesOff, isAllPhasesOn } from './measurements';
import { getNumberOfPhases, getTestPowerSupply, sleep } from './util';

import { ACTIVATION_TIME_MS, DEVICE_REACTION_GRACE_TIME_MS, POWER_SUPPLY_ON_TIME_MS } from './constants';
import { DeviceState, DeviceType, StorageAdapter } from '@src/types';
import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';

export const validateRelayFunctionality = async (
  device: DeviceState,
  messageAdapter: DeviceMessageAdapter,
  storageAdapter: StorageAdapter,
  deviceType: DeviceType
) => {
  const { relay_id, meter_id } = device;

  const numberOfPhases = getNumberOfPhases(deviceType);

  const { messageSentAt } = await messageAdapter.publishDeviceMessage(
    storageAdapter,
    { relay_id, meter_id, id: device.id } as DeviceState,
    'on',
    ACTIVATION_TIME_MS
  );

  await sleep(DEVICE_REACTION_GRACE_TIME_MS);

  const powerMeasurement = await getMeterPhasesCurrent(meter_id, messageSentAt, storageAdapter);

  await messageAdapter.publishDeviceMessage(
    storageAdapter,
    { relay_id, meter_id, id: device.id } as DeviceState,
    'off'
  );

  return isAllPhasesOn(powerMeasurement, numberOfPhases);
};

export const isRelayOffWhenPowerResets = async (
  device: DeviceState,
  messageAdapter: DeviceMessageAdapter,
  storageAdapter: StorageAdapter,
  deviceType: DeviceType
) => {
  const powerSupply = getTestPowerSupply(deviceType);

  messageAdapter.publishDeviceMessage(storageAdapter, { relay_id: powerSupply, id: device.id } as DeviceState, 'off');

  await sleep(DEVICE_REACTION_GRACE_TIME_MS);

  messageAdapter.publishDeviceMessage(
    storageAdapter,
    { relay_id: powerSupply, id: device.id } as DeviceState,
    'on',
    POWER_SUPPLY_ON_TIME_MS
  );

  await sleep(DEVICE_REACTION_GRACE_TIME_MS);

  const backOnTimestamp = new Date();

  const powerMeasurement = await getMeterPhasesCurrent(device.meter_id, backOnTimestamp, storageAdapter);

  if (powerMeasurement) {
    return isAllPhasesOff(powerMeasurement);
  }

  return false;
};
