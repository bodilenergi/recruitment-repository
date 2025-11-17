import { getManagerMessageClient } from './managerClient';

type MessageHandler = (topic: string, message: Buffer) => void;

export const listenForDeviceMessages = (handler: MessageHandler) => {
  getManagerMessageClient().on('message', (topic, message) => handler(topic, message));
};
