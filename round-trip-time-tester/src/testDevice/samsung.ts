import { mapSeries } from 'bluebird';
import { DEVICE_REACTION_GRACE_TIME_MS, POWER_SUPPLY_ON_TIME_MS } from './constants';
import { sleep, getSimulatedExternalController, getTestPowerSupply, getNumberOfPhases } from './util';
import { getMeterPhasesCurrent, isOnePhaseOff } from './measurements';

import { DeviceState, DeviceType, StorageAdapter } from '@src/types';
import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';

const SAMSUNG_TEST_DEVICE_RELAY_IDS = [
  'shellyplus1-cc7b5c85af78',
  'shellyplus1-cc7b5c85d114',
  'shellyplus1-e465b8f25d40',
];

const ON_STATE_TEST_BUFFER_TIME_MS = 30000;

export const inspectHeatPumpShortCircuit = async (
  device: DeviceState,
  deviceType: DeviceType,
  messageAdapter: DeviceMessageAdapter,
  storageAdapter: StorageAdapter
) => {
  const externalControlId = getSimulatedExternalController(deviceType);

  messageAdapter.publishDeviceMessage(
    storageAdapter,
    { relay_id: externalControlId, id: device.id } as DeviceState,
    'on',
    ON_STATE_TEST_BUFFER_TIME_MS
  );

  const validatedPhases: boolean[] = await mapSeries(SAMSUNG_TEST_DEVICE_RELAY_IDS, async id => {
    const { messageSentAt } = messageAdapter.publishDeviceMessage(
      storageAdapter,
      { relay_id: id, id: device.id } as DeviceState,
      'off'
    );

    await sleep(DEVICE_REACTION_GRACE_TIME_MS);

    const powerMeasurement = await getMeterPhasesCurrent(device.meter_id, messageSentAt, storageAdapter);
    const numberOfPhases = getNumberOfPhases(deviceType);

    messageAdapter.publishDeviceMessage(
      storageAdapter,
      { relay_id: id, id: device.id } as DeviceState,
      'on',
      ON_STATE_TEST_BUFFER_TIME_MS
    );

    await sleep(DEVICE_REACTION_GRACE_TIME_MS);

    return isOnePhaseOff(powerMeasurement, numberOfPhases);
  });

  const powerSupply = getTestPowerSupply(deviceType);

  messageAdapter.publishDeviceMessage(storageAdapter, { relay_id: powerSupply, id: device.id } as DeviceState, 'off');

  await sleep(DEVICE_REACTION_GRACE_TIME_MS);

  messageAdapter.publishDeviceMessage(
    storageAdapter,
    { relay_id: powerSupply, id: device.id } as DeviceState,
    'on',
    POWER_SUPPLY_ON_TIME_MS
  );

  return !validatedPhases.some(validatedPhase => !validatedPhase);
};
