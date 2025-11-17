import { validateRelayFunctionality, isRelayOffWhenPowerResets } from './relay';
import { inspectExternalControllerFunctionality } from './externalController';

import { inspectHeatPumpShortCircuit } from './samsung';
import { StorageAdapter } from '@src/types';
import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';

export const testDevice = async (
  storageAdapter: StorageAdapter,
  messageAdapter: DeviceMessageAdapter,
  deviceId: string
): Promise<{ success: boolean; stepFailed: string | null }> => {
  try {
    const device = await storageAdapter.deviceState.findOne({ id: deviceId });

    if (!device) {
      return { success: false, stepFailed: 'getDeviceState' };
    }

    const deviceType = device.device_type;

    if (deviceType === 'samsung') {
      const noShortCircuit = await inspectHeatPumpShortCircuit(device, deviceType, messageAdapter, storageAdapter);

      if (!noShortCircuit) {
        return { success: false, stepFailed: 'inspectHeatPumpShortCircuit' };
      }
    }

    const relayIsOffWhenPowerResets = await isRelayOffWhenPowerResets(
      device,
      messageAdapter,
      storageAdapter,
      deviceType
    );

    if (!relayIsOffWhenPowerResets) {
      return { success: false, stepFailed: 'isRelayOffWhenPowerResets' };
    }

    if (deviceType != 'panasonic') {
      const originalFunctionalityPreserved = await inspectExternalControllerFunctionality(
        device,
        messageAdapter,
        storageAdapter,
        deviceType
      );

      if (!originalFunctionalityPreserved) {
        return { success: false, stepFailed: 'inspectExternalControllerFunctionality' };
      }
    }
    const relayWorks = await validateRelayFunctionality(device, messageAdapter, storageAdapter, deviceType);

    if (!relayWorks) {
      return { success: false, stepFailed: 'validateRelayFunctionality' };
    }

    return { success: true, stepFailed: null };
  } catch (error) {
    return { success: false, stepFailed: `an error occurred while testing - ${error}` };
  }
};
