import { Param, ParseDatePipe } from '@nestjs/common';

export function DateParam(param: string) {
  return Param(param, new ParseDatePipe());
}
