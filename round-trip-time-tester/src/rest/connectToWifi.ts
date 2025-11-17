import { Context, Router } from '@src/types';
import { addProtectedRoute } from './route';
import { writeContextError, writeContextResponse } from '@src/util';
import { DeviceState } from '@beam/storage';

type wifiParameters = {deviceId: string; wifiSsid: string; wifiPassword: string;}

export const addDeviceWifiRoute = (router: Router) => {
  addProtectedRoute(router, 'post', '/connectToWifi', runConnectToWifi);
};

const runConnectToWifi = async (ctx: Context) => {
  try {
    const { storageAdapter, messageAdapter } = ctx.adapters;

    const { deviceId, wifiSsid, wifiPassword } = validateBody(ctx.request.body as wifiParameters);

    const device = await storageAdapter.deviceState.findOne({id: deviceId}) as DeviceState;

    const { error } = await messageAdapter.connectToWifi({device, wifiSsid, wifiPassword});

    if( error ){
      return writeContextError(ctx, 500, error);
    }

    return writeContextResponse(ctx, 200, 'The wifi is updated on the device.');
  } catch ( error ) {
    if ( error instanceof Error ) {
      return writeContextError(ctx, 500, error.message);
    }
    return writeContextError(ctx, 500, 'Unknown error when triggering the wifi update.');
  }
};

const validateBody = (parameters: wifiParameters) => {
  const { deviceId, wifiSsid, wifiPassword } = parameters;

  if (!deviceId) {
    throw new Error(`Missing required field 'deviceId'`);
  }
  if (!wifiSsid) {
    throw new Error(`Missing required field 'wifiSsid'`);
  }
  if (!wifiPassword) {
    throw new Error(`Missing required field 'wifiPassword'`);
  }

  return { deviceId, wifiSsid, wifiPassword };
};
