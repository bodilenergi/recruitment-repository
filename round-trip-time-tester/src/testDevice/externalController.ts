import { getMeterPhasesCurrent, isAllPhasesOff, isAllPhasesOn } from './measurements';
import { getNumberOfPhases, getSimulatedExternalController, sleep } from './util';

import { ACTIVATION_TIME_MS, DEVICE_REACTION_GRACE_TIME_MS } from './constants';
import { DeviceState, DeviceType, StorageAdapter } from '@src/types';
import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';

export const inspectExternalControllerFunctionality = async (
  device: DeviceState,
  messageAdapter: DeviceMessageAdapter,
  storageAdapter: StorageAdapter,
  deviceType: DeviceType
) => {
  const numberOfPhases = getNumberOfPhases(deviceType);

  const externalController = getSimulatedExternalController(deviceType);

  const offIsPreserved = await isOffPreserved(device, messageAdapter, storageAdapter, externalController);

  const onIsPreserved = await isOnPreserved(device, messageAdapter, storageAdapter, externalController, numberOfPhases);

  return onIsPreserved && offIsPreserved;
};

const isOnPreserved = async (
  device: DeviceState,
  messageAdapter: DeviceMessageAdapter,
  storageAdapter: StorageAdapter,
  externalController: string,
  numberOfPhases: number
) => {
  const { messageSentAt } = messageAdapter.publishDeviceMessage(
    storageAdapter,
    {
      relay_id: externalController,
      id: device.id,
    } as DeviceState,
    'on',
    ACTIVATION_TIME_MS
  );

  await sleep(DEVICE_REACTION_GRACE_TIME_MS);

  const powerMeasurement = await getMeterPhasesCurrent(device.meter_id, messageSentAt, storageAdapter);

  return isAllPhasesOn(powerMeasurement, numberOfPhases);
};

const isOffPreserved = async (
  device: DeviceState,
  messageAdapter: DeviceMessageAdapter,
  storageAdapter: StorageAdapter,
  externalController: string
) => {
  const { messageSentAt } = messageAdapter.publishDeviceMessage(
    storageAdapter,
    {
      relay_id: externalController,
      id: device.id,
    } as DeviceState,
    'off'
  );

  await sleep(DEVICE_REACTION_GRACE_TIME_MS);

  const powerMeasurement = await getMeterPhasesCurrent(device.meter_id, messageSentAt, storageAdapter);

  return isAllPhasesOff(powerMeasurement);
};
