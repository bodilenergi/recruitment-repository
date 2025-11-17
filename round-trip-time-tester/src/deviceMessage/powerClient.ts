import mqtt from 'mqtt';

import { connectToBroker } from './connect';
import { POWER_BROKER_URL } from '@src/constants';

let client: mqtt.MqttClient | null = null;

export const getPowerMessageClient = (): mqtt.MqttClient => {
  const url = POWER_BROKER_URL;

  if (client !== null) {
    return client;
  }

  try {
    client = connectToBroker(url);

    return client;
  } catch (error) {
    console.debug(error);
    throw new Error('An error occurred during the initialization of the client MQTT.');
  }
};
