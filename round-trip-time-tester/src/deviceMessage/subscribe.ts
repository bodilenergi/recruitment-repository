import { getManagerMessageClient } from './managerClient';

export const subscribeToTopic = (topic: string, callback: () => void) =>
  getManagerMessageClient().subscribe(topic, error => {
    if (error) {
      console.error('Failed to subscribe to topic:', error);
      throw error;
    } else {
      callback();
    }
  });

export const unsubscribeToTopic = (topic: string) => getManagerMessageClient().unsubscribe(topic);
