import mqtt from 'mqtt';
import { QoS } from 'mqtt-packet';

import { getManagerMessageClient } from './managerClient';
import { DeviceMode, DeviceState, StorageAdapter } from '@beam/storage';
import { DEFAULT_BOOST_TIME_S } from '@src/constants';
import { getPowerMessageClient } from './powerClient';
import { EventStatus } from '@src/types';

const MQTT_TOPIC = 'command/switch';

export const publishDeviceMessage = (
  storage: StorageAdapter,
  device: DeviceState,
  deviceMode: DeviceMode,
  activationTimeS = DEFAULT_BOOST_TIME_S,
  isSingleDevice = false,
  event: EventStatus = 'commandSentToDeviceDuringRoundTripTest'
) => {
  if (deviceMode === 'on' && !activationTimeS && event !== 'customerSwitchTriggered' ) {
    throw new Error('Missing activation time for on operation!');
  }
  const { relay_id, id: device_id, device_type } = device;

  const switchId = device_type === 'emswitch' ? '100' : '0';

  storage.eventLog.create({
    device_id,
    event_status: event,
    activation_mode: deviceMode,
    ...(deviceMode === 'on' && { activation_time: activationTimeS }),
  });

  const client = isSingleDevice ? getPowerMessageClient() : getManagerMessageClient();

  const messageSentAt = new Date();

  const payload = prepareStatePayload(deviceMode, deviceMode === 'on' && event !== 'customerSwitchTriggered' ? activationTimeS : undefined);

  publishMessageToTopic(`${relay_id}/${MQTT_TOPIC}:${switchId}`)(client, payload);

  return { payload, messageSentAt };
};

const prepareStatePayload = (deviceMode: DeviceMode, activationTimeS?: number): string =>
  activationTimeS ? `${deviceMode}, ${Math.ceil(activationTimeS)}` : `${deviceMode}`;

const publishMessageToTopic =
  (topic: string, qos: QoS = 1) =>
  (client: mqtt.MqttClient, payload: string, retain = false) => {
    console.log(`Published message '${payload}' to '${topic}' using client '${client.options.clientId}'`);

    return client.publish(topic, payload, { qos: qos, retain: retain }, error => {
      if (error) {
        console.error(`failed to publish message: ${payload} to ${topic}. ${error}`);
      }
    });
  };

export const disconnect = (client: mqtt.MqttClient) => client.end();
