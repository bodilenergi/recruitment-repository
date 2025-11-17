import * as mqtt from 'mqtt';

import { connectToBroker } from './connect';

import { MQTT_BROKER_URL } from '@src/constants';

let client: mqtt.MqttClient | null = null;

export const getManagerMessageClient = (): mqtt.MqttClient => {
  if (client !== null) {
    return client;
  }

  try {
    client = connectToBroker(MQTT_BROKER_URL);

    return client;
  } catch (error) {
    console.debug(error);
    throw new Error('An error occurred during the initialization of the client MQTT.');
  }
};
