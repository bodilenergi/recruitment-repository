import * as dotenv from 'dotenv';

import { initSentry } from './sentry';

dotenv.config();

import { startServer } from './server';

initSentry();

startServer();
