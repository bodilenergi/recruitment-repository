import { AUTH_KEY } from '@src/constants';
import { Context, Router } from '@src/types';
import { writeContextError } from '@src/util';

type Method = 'get' | 'post' | 'put' | 'delete';

const authenticateRequest = (ctx: Context) => {
  const authorizationHeader = ctx.request.headers.authorization;

  const token = authorizationHeader?.split(' ')[1];

  if (token !== AUTH_KEY) {
    writeContextError(ctx, 401, 'please provide the api key in the authorization header');

    return false;
  }

  return true;
};

export const addRoute = (router: Router, method: Method, endpoint: string, routeFunction: (ctx: Context) => void) => {
  switch (method) {
    case 'get': {
      return router.get(endpoint, routeFunction, () => true);
    }

    case 'post': {
      return router.post(endpoint, routeFunction, () => true);
    }

    case 'put': {
      return router.put(endpoint, routeFunction, () => true);
    }

    case 'delete': {
      return router.delete(endpoint, routeFunction, () => true);
    }
  }
};

export const addProtectedRoute = (
  router: Router,
  method: Method,
  endpoint: string,
  routeFunction: (ctx: Context) => void
) => {
  const route = (ctx: Context) => {
    if (!authenticateRequest(ctx)) {
      return;
    }

    return routeFunction(ctx);
  };

  addRoute(router, method, endpoint, route);
};
