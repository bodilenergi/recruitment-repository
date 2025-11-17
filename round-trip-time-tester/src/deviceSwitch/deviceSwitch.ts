import { StorageAdapter } from '@beam/storage';
import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';
import { DeviceMode } from '@src/types';

export const deviceSwitch =
  (storage: StorageAdapter, messageAdapter: DeviceMessageAdapter) =>
  async (deviceId: string, switchStatus: DeviceMode) => {
    const device = await storage.deviceState.findOne({ id: deviceId });

    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    const isSingleDevice = device.relay_id === device.meter_id;

    messageAdapter.publishDeviceMessage(
      storage,
      device,
      switchStatus,
      undefined,
      isSingleDevice,
      'customerSwitchTriggered'
    );

    return {
      success: true,
      deviceId,
      newStatus: switchStatus,
      message: `Device ${deviceId} switched ${switchStatus}`,
    };
  };
