import { StorageAdapter } from '@src/types';
import { sleep } from './util';

const AMPERE_ERROR_TOLERANCE = 0.3;

const GET_MEASUREMENTS_TIMEOUT_MS = 500;

const GET_MEASUREMENTS_MAX_TRIES = 100;

export const isAllPhasesOn = (currentMeasurements: number[], numberOfPhases: number) => {
  const measurementsAboveThreshold = currentMeasurements.filter(measurement => measurement > AMPERE_ERROR_TOLERANCE);

  return measurementsAboveThreshold.length === numberOfPhases;
};

export const isAllPhasesOff = (currentMeasurements: number[]) => {
  const measurementsAboveThreshold = currentMeasurements.filter(measurement => measurement > AMPERE_ERROR_TOLERANCE);

  return measurementsAboveThreshold.length === 0;
};

export const isOnePhaseOff = (currentMeasurements: number[], numberOfPhases: number) => {
  const measurementsAboveThreshold = currentMeasurements.filter(measurement => measurement > AMPERE_ERROR_TOLERANCE);

  return measurementsAboveThreshold.length === numberOfPhases - 1;
};

export const getMeterPhasesCurrent = async (
  meterId: string,
  sentTimestamp: Date,
  storageAdapter: StorageAdapter
): Promise<number[]> => {
  let queryTryCount = 0;

  while (queryTryCount <= GET_MEASUREMENTS_MAX_TRIES) {
    const document = await storageAdapter.powerMeasurement.findOne({
      timestamp: { $gt: sentTimestamp },
      id: meterId,
    });

    if (document) {
      const currentA = document.a_current ?? 0;
      const currentB = document.b_current ?? 0;
      const currentC = document.c_current ?? 0;
      const current = document.current ?? 0;

      return [currentA, currentB, currentC, current];
    }

    queryTryCount += 1;

    await sleep(GET_MEASUREMENTS_TIMEOUT_MS);
  }

  return [];
};
