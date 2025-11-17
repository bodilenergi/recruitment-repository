import { StorageAdapter, MeterData } from '@src/types';
import { BLOCKED_OPERATION_THRESHOLD, DELAY_QUERY_MS } from '@src/constants';
import { sleep } from '@src/util';

export const retrieveLastMeasurementDuringActivation = async (
  storageAdapter: StorageAdapter,
  commandSentTimestamp: number,
  boostTimeMS: number,
  queryMeterId: string
): Promise<MeterData | undefined> => {
  let iteration = 0;

  while (iteration < BLOCKED_OPERATION_THRESHOLD) {
    const document = await storageAdapter.powerMeasurement.findLastWithinTimespan(
      queryMeterId,
      new Date(commandSentTimestamp),
      new Date(commandSentTimestamp + boostTimeMS)
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
