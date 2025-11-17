import { Context, Router } from '@src/types';
import { addProtectedRoute } from './route';
import { writeContextError, writeContextResponse } from '@src/util';
import { deviceSwitch } from '@src/deviceSwitch/deviceSwitch';

type switchParameters = {deviceId: string; switchStatus: 'on' | 'off'}

export const addDeviceSwitchRoute = (router: Router) => {
  addProtectedRoute(router, 'post', '/runDeviceSwitch', runDeviceSwitch);
};

const runDeviceSwitch = async (ctx: Context) => {
  try {
    const { storageAdapter, messageAdapter } = ctx.adapters;

    const { deviceId, switchStatus } = validateBody(ctx.request.body as switchParameters);



    const result = await deviceSwitch(storageAdapter, messageAdapter)(deviceId, switchStatus);

    return writeContextResponse(ctx, 200, result);
  } catch (error) {
    if (error instanceof Error) {
      return writeContextError(ctx, 500, error.message);
    }
    return writeContextError(ctx, 500, 'Unknown error when triggering the device switch.');
  }
};

const validateBody = (parameters: switchParameters) => {
  const { deviceId, switchStatus } = parameters;

  if(switchStatus !== 'on' && switchStatus !== 'off') {
    throw new Error(`Invalid switchStatus: ${switchStatus}. Must be 'on' or 'off'.`);
  }

  if (!deviceId) {
    throw new Error(`Missing required field 'deviceId'`);
  }

  return { deviceId, switchStatus };
};
