import { Context, LogEvent, Router } from '@src/types';
import { addProtectedRoute } from './route';

import { writeContextError } from '@src/util';
import { startResponsivenessCheck } from '@src/responsivenessCheck/responsivenessCheck';

export const addRunResponsivenessCheckRoute = (router: Router) => {
  addProtectedRoute(router, 'post', '/runResponsivenessCheck', runResponsivenessCheck);
};

const runResponsivenessCheck = async (ctx: Context) => {
  try {
    const { storageAdapter, messageAdapter } = ctx.adapters;

    const responsivenessCheckStartEventLog: Omit<LogEvent, 'timestamp'> = {
      event_status: 'responsivenessCheckStarted',
    };

    ctx.adapters.storageAdapter.eventLog.create(responsivenessCheckStartEventLog);

    return await startResponsivenessCheck(storageAdapter, messageAdapter);
  } catch (error) {
    if (error instanceof Error) {
      return writeContextError(ctx, 500, error.message);
    }
    return writeContextError(ctx, 500, 'Unknown error in RTT Service.');
  }
};
