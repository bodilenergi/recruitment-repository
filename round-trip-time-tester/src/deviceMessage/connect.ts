import * as mqtt from 'mqtt';

export type Credentials = {
  username: string;
  password: string;
  ca: string;
  key: string;
  cert: string;
};

export const connectToBroker = (brokerURL?: string, clientID?: string, credentials?: Credentials): mqtt.MqttClient => {
  if (!brokerURL) {
    throw new Error('Broker connection url not declared in the environment configuration.');
  }

  if (clientID === undefined) {
    clientID = `beam_tester_mqtt_${Math.random().toString(16).slice(3)}`;
  }

  const splitUrl = brokerURL.split(':');
  const port = Number(splitUrl[splitUrl.length - 1]);

  let connectionOptions = {
    ...(credentials && { ...credentials }),
    rejectUnauthorized: credentials ? true : false,
    clientId: clientID,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 5000,
    port,
    protocolVersion: 5 as const,
  };

  const client = mqtt.connect(brokerURL, connectionOptions);

  if (client === null) {
    throw new Error('Failed to connect to broker!');
  }

  client.on('connect', () => {
    console.log(`Client ${clientID} connected to ${brokerURL}`);
  });

  client.on('disconnect', packet => {
    console.log(`Client ${clientID} disconnected from ${brokerURL}`);
    console.debug(`Packet: ${packet.cmd} - ${packet.length} - ${packet.messageId}`);
  });

  client.on('error', error => {
    console.error(`Client ${clientID} error ${error} (broker: ${brokerURL})`);
  });

  client.on('reconnect', () => {
    console.log(`Client ${clientID} trying to reconnect to ${brokerURL}`);
  });

  client.on('close', () => {
    console.log(`Client ${clientID} closed connection to ${brokerURL}`);
  });

  client.on('offline', () => {
    console.log(`Client ${clientID} is now offline (broker: ${brokerURL})`);
  });

  client.on('end', () => {
    console.debug(`Client ${clientID} callback handler ended successfully (broker: ${brokerURL})`);
  });

  return client;
};
