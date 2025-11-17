import { listenForDeviceMessages } from './listen';
import { getManagerMessageClient } from './managerClient';
import { publishDeviceMessage } from './send';
import { connectToWifi } from './sendConfigMessage';
import { subscribeToTopic } from './subscribe';

export type DeviceMessageAdapter = Awaited<ReturnType<typeof deviceMessageAdapter>>;

export const deviceMessageAdapter = () => {
  getManagerMessageClient();

  return {
    publishDeviceMessage,
    listenForDeviceMessages,
    subscribeToTopic,
    connectToWifi,
  };
};
