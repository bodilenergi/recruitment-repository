const SECOND_IN_MS = 1000;

const MINUTE_IN_MS = SECOND_IN_MS * 60;

const HOUR_IN_MS = MINUTE_IN_MS * 60;

const DAY_IN_MS = HOUR_IN_MS * 24;

export const sleep = async (period: number) => new Promise(resolve => setTimeout(resolve, period));

export const toMilliseconds = (period: number, unit: 'seconds' | 'minutes' | 'hours' | 'days') => {
  switch (unit) {
    case 'seconds': {
      return period * SECOND_IN_MS;
    }

    case 'minutes': {
      return period * MINUTE_IN_MS;
    }

    case 'hours': {
      return period * HOUR_IN_MS;
    }

    case 'days': {
      return period * DAY_IN_MS;
    }

    default:
      throw new Error("Invalid unit provided. Must be 'seconds', 'minutes', 'hours' or 'days'.");
  }
};
