import { writeContextResponse } from '@src/util';
import { Context, Router } from '@src/types';
import { addRoute } from './route';

export const addHealthcheckRoutes = (router: Router) => {
  addRoute(router, 'get', '/healthcheck', healthcheck);
};

const healthcheck = (ctx: Context) =>
  writeContextResponse(ctx, 200, { uptime: process.uptime(), timestamp: Date.now() });
