import mqtt from 'mqtt';
import { QoS } from 'mqtt-packet';

import { getManagerMessageClient } from './managerClient';
import { DeviceState } from '@beam/storage';
import { getPowerMessageClient } from './powerClient';
import { sleep } from '@src/util';

export const connectToWifi = async (parameters:{
  device: DeviceState;
  wifiSsid: string;
  wifiPassword: string;
}
) => {
  try{
    const { device, wifiSsid, wifiPassword } = parameters;

    const { relay_id, meter_id } = device;

    const isSingleDevice = relay_id === meter_id;

    const subDevices = isSingleDevice ? [{id: relay_id, client: getPowerMessageClient()}] : [{id: relay_id, client: getManagerMessageClient()}, {id: meter_id, client: getPowerMessageClient()}];



    subDevices.forEach(async (subDevice:{id:string; client: mqtt.MqttClient })=>{
        const { id: subDeviceId, client } = subDevice;
        
        publishMessageToTopic(`${relay_id}/rpc`)(client, generateWifiPayload({subDeviceId, wifiSsid, wifiPassword}));

        await sleep(1000);

        publishMessageToTopic(`${relay_id}/rpc`)(client, generateRebootPayload(subDeviceId));
      }
    )

    return {};
  }
  catch(error){
    return {error: `Error in connectToWifi: ${error}`};
  }

};

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

const generateWifiPayload = (parameters:{subDeviceId: string; wifiSsid: string; wifiPassword:string}) => {
  const { subDeviceId, wifiSsid, wifiPassword } =  parameters;

  return JSON.stringify({
    id: 1,
    src:`${subDeviceId}/setConfigResponse`,

    method: "Wifi.SetConfig",
    params: {
      id:0,
      config: {
        id:0,
        sta: {
          ssid: wifiSsid,
          pass: wifiPassword,
          enable: true
        }
      }
    }
  });
}

const generateRebootPayload = (subDeviceId:string) => JSON.stringify({
  id: 0,
  src: `${subDeviceId}/rebooting`,
  method: 'Shelly.Reboot'
});


