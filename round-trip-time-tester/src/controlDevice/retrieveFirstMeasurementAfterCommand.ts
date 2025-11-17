import { StorageAdapter, MeterData } from '@src/types';
import { BLOCKED_OPERATION_THRESHOLD, DELAY_QUERY_MS, DEVICE_STATIC_DRAW_WATTS } from '@src/constants';
import { sleep } from '@src/util';

export const retrieveFirstMeasurementAfterCommand = async (
  storageAdapter: StorageAdapter,
  commandSentTimestamp: number,
  queryMeterId: string
): Promise<MeterData | undefined> => {
  let iteration = 0;

  while (iteration < BLOCKED_OPERATION_THRESHOLD) {
    const document = await storageAdapter.powerMeasurement.findFirstAfterTimestamp(
      queryMeterId,
      new Date(commandSentTimestamp),
      DEVICE_STATIC_DRAW_WATTS
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
