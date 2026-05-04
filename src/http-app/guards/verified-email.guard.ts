import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthUser } from '../authentication';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest() as { user: AuthUser };

    return !!user && user.isEmailVerified;
  }
}
