import Router from 'koa-router';
import BodyParser from 'koa-bodyparser';

import { Server } from '@src/types';
import { addRunRttTestRoute } from './runRttTest';
import { addDeviceTestRoute } from './runDeviceTest';
import { addHealthcheckRoutes } from './healthcheck';
import { addDeviceSwitchRoute } from './runDeviceSwitch';
import { addDeviceWifiRoute } from './connectToWifi';

export const addRestRoutes = (server: Server) => {
  const router = new Router();

  server.use(
    BodyParser({
      onerror: function (err, ctx) {
        ctx.throw(422, `body parse error: ${err}`);
      },
    })
  );

  addHealthcheckRoutes(router);

  addRunRttTestRoute(router);

  addDeviceTestRoute(router);
  
  addDeviceSwitchRoute(router);
  
  addDeviceWifiRoute(router);

  server.use(router.routes());
};
