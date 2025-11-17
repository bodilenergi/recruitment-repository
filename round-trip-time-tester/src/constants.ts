import path from 'path';
import { readEnvVariable, readRequiredEnvVariable } from './util';

export const ENVIRONMENT = readRequiredEnvVariable('ENVIRONMENT');

export const MQTT_BROKER_URL = readRequiredEnvVariable('MQTT_BROKER');
export const POWER_BROKER_URL = readRequiredEnvVariable('POWER_BROKER');
export const MQTT_TRIGGER_TOPIC = 'bodil/rtt';
export const MQTT_RESULTS_TOPIC = 'bodil/rtt/results';

export const DEFAULT_BOOST_TIME_S = 5;
export const EXTRA_WAIT_TIME_S = 5;

export const DEFAULT_ITERATIONS = 10;
export const DEFAULT_WAIT_TIME_MS = 10000;
export const DELAY_QUERY_MS = 500;
export const BLOCKED_OPERATION_THRESHOLD = 15000 / DELAY_QUERY_MS;

export const OUTPUT_PATH = path.resolve('./results/');
export const OUTPUT_FILE = path.resolve(OUTPUT_PATH, 'timestamp_results.json');

export const DEVICE_STATIC_DRAW_WATTS = 20;

export const RELAY_STATUS_ENDPOINT = '/status/switch:0';
export const RELAY_COMMAND_ENDPOINT = '/command/switch:0';

export const AUTH_KEY = readRequiredEnvVariable('AUTH_KEY');

export const MONGO_URI = readRequiredEnvVariable('MONGO_URI');
export const MONGO_DB = readRequiredEnvVariable('MONGO_DB');

export const SENTRY_DSN = readEnvVariable('SENTRY_DSN', '');

export const SIMULATED_THERMOSTAT = 'shellyplus1-e465b8f42cac';
export const SIMULATED_HEATPUMP = 'shellyplus1-cc7b5c847fc4';
export const POWER_SUPPLY_THERMOSTAT = 'shellyplus1-10061cd39dcc';
export const POWER_SUPPLY_HEATPUMP = 'shellyplus1-cc7b5c8785e8';
