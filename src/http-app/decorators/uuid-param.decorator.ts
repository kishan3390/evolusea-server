import { Param, ParseUUIDPipe } from '@nestjs/common';

export function UuidParam(param: string) {
  return Param(param, new ParseUUIDPipe());
}
