import * as Sentry from '@sentry/node';
import { ENVIRONMENT, SENTRY_DSN } from './constants';

export * as Sentry from '@sentry/node';

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    tracesSampleRate: 0.1,
  });
};
