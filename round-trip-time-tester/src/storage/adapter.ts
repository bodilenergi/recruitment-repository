import { getStorageAdapter } from '@beam/storage';
import { MONGO_DB, MONGO_URI } from '@src/constants';

export const storageAdapter = async () => await getStorageAdapter(MONGO_URI, MONGO_DB);
