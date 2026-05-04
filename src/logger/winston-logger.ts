import { Loggly } from 'winston-loggly-bulk';
import { transports, format, Logger, createLogger } from 'winston';
import { LoggerService } from '@nestjs/common';

import { appEnv, LoggerConfig } from '../config';

export class WinstonLogger implements LoggerService {
  private readonly winstonLogger: Logger;

  constructor(config: LoggerConfig) {
    const { combine, splat, timestamp, printf, colorize } = format;

    const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}] : ${message} `;
      if (metadata) {
        msg += JSON.stringify(metadata);
      }
      return msg;
    });

    this.winstonLogger = createLogger({
      level: config.level,
      transports: [
        new transports.Console({
          format: combine(colorize(), splat(), timestamp(), myFormat),
        }),
        ...(!appEnv.isLocal ? [new Loggly(config.loggly)] : []),
      ],
      defaultMeta: { env: appEnv.getEnv },
    });
  }

  debug(message: any) {
    this.winstonLogger.debug(message);
  }

  verbose(message: any) {
    this.winstonLogger.verbose(message);
  }

  log(message: any) {
    this.winstonLogger.log(message);
  }

  error(message: any) {
    this.winstonLogger.error(message);
  }

  warn(message: any) {
    this.winstonLogger.warn(message);
  }
}
