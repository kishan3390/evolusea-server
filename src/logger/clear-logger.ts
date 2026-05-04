import { LoggerService } from '@nestjs/common';
import { noop } from 'lodash';

export class ClearLogger implements LoggerService {
  debug(message: any): void {
    return noop();
  }

  verbose(message: any): void {
    return noop();
  }

  log(message: any): void {
    return noop();
  }

  error(message: any): void {
    return noop();
  }

  warn(message: any): void {
    return noop();
  }
}
