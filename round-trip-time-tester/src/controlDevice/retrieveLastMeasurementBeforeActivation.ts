import { StorageAdapter, MeterData } from '@src/types';
import { BLOCKED_OPERATION_THRESHOLD, DELAY_QUERY_MS } from '@src/constants';
import { sleep, toMilliseconds } from '@src/util';

export const retrieveLastMeasurementBeforeActivation = async (
  storageAdapter: StorageAdapter,
  commandSentTimestamp: number,
  queryMeterId: string
): Promise<MeterData | undefined> => {
  let iteration = 0;

  while (iteration < BLOCKED_OPERATION_THRESHOLD) {
    const document = await storageAdapter.powerMeasurement.findLastWithinTimespan(
      queryMeterId,
      new Date(commandSentTimestamp - toMilliseconds(5, 'minutes')),
      new Date(commandSentTimestamp)
    );

    if (document) {
      const { timestamp: meterDate, active_power: power } = document;

      const meterTimestamp = meterDate.getTime();

      const deltaMeter = document.timestamp.getTime() - commandSentTimestamp;

      return { meterTimestamp, power, deltaMeter };
    }

    iteration++;

    await sleep(DELAY_QUERY_MS);
  }

  return undefined;
};
