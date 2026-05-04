import {
  mixin,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export interface ApiKeyGuardParams {
  header: string;
  expectedKey: string;
}

export const ApiKeyGuard = (params: ApiKeyGuardParams) => {
  @Injectable()
  class ApiKeyGuardMixin implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
      const request = ctx.switchToHttp().getRequest<Request>();
      const key = request.header(params.header);
      return key === params.expectedKey;
    }
  }
  return mixin(ApiKeyGuardMixin);
};
