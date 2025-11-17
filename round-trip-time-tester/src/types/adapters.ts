import { DeviceMessageAdapter } from '@src/deviceMessage/adapter';
import { StorageAdapter } from '@src/types';

export type Adapters = {
  storageAdapter: StorageAdapter;
  messageAdapter: DeviceMessageAdapter;
};
