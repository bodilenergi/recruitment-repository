import { DeviceType } from '@src/types';
import {
  POWER_SUPPLY_HEATPUMP,
  POWER_SUPPLY_THERMOSTAT,
  SIMULATED_HEATPUMP,
  SIMULATED_THERMOSTAT,
} from '@src/constants';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getNumberOfPhases = (deviceType: DeviceType) => {
  switch (deviceType) {
    case 'samsung':
      return 3;
    case 'panasonic':
      return 3;
    case 'metroThermPro':
      return 2;
    case 'metroThermMini':
      return 1;
    default:
      throw new Error('Device type not recognized!');
  }
};

export const getSimulatedExternalController = (deviceType: DeviceType) => {
  switch (deviceType) {
    case 'samsung':
      return SIMULATED_HEATPUMP;
    case 'panasonic':
      return SIMULATED_HEATPUMP;
    case 'metroThermPro':
      return SIMULATED_THERMOSTAT;
    case 'metroThermMini':
      return SIMULATED_THERMOSTAT;
    default:
      throw new Error('Device type not recognized!');
  }
};

export const getTestPowerSupply = (deviceType: DeviceType) => {
  switch (deviceType) {
    case 'samsung':
      return POWER_SUPPLY_HEATPUMP;
    case 'panasonic':
      return POWER_SUPPLY_HEATPUMP;
    case 'metroThermPro':
      return POWER_SUPPLY_THERMOSTAT;
    case 'metroThermMini':
      return POWER_SUPPLY_THERMOSTAT;
    default:
      throw new Error('Device type not recognized!');
  }
};
