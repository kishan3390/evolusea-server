import { LogglyOptions } from 'winston-loggly-bulk';

export interface LoggerConfig {
  loggly: LogglyOptions;
  level: string;
}
