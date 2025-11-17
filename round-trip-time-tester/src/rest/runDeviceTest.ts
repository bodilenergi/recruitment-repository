import { writeContextResponse } from '@src/util';

import { addProtectedRoute } from './route';
import { Context, Router } from '@src/types';
import { testDevice } from '@src/testDevice';

export const addDeviceTestRoute = (router: Router) => {
  addProtectedRoute(router, 'post', '/runDeviceTest', runDeviceTest);
};

type TestDeviceBody = { deviceId: string };

const runDeviceTest = async (ctx: Context) => {
  const { deviceId } = ctx.request.body as TestDeviceBody;

  const { storageAdapter, messageAdapter } = ctx.adapters;

  const result = await testDevice(storageAdapter, messageAdapter, deviceId);

  return writeContextResponse(ctx, 200, result);
};
