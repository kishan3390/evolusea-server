import { LoggerService } from '@nestjs/common';

import { LoggerConfig } from '../config';
import { ClearLogger } from './clear-logger';
import { WinstonLogger } from './winston-logger';

export let logger: LoggerService = new ClearLogger();

export enum LoggerType {
  CLEAR = 'clear',
  WINSTON = 'winston',
}

export const initLogger = (type: LoggerType, config: LoggerConfig) => {
  switch (type) {
    case LoggerType.WINSTON:
      logger = new WinstonLogger(config);
      break;
    default:
      logger = new ClearLogger();
  }
};
