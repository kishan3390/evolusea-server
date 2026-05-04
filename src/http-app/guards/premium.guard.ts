import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthUser } from '../authentication';

@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest() as { user: AuthUser };

    if (!user || !user.hasPremiumEntitlement) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PREMIUM_REQUIRED',
        message: 'This feature requires a Premium subscription',
      });
    }

    return true;
  }
}
