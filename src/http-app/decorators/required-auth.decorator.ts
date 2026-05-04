import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import {
  FirebaseAuthGuard,
  HasUserProfileGuard,
  VerifiedEmailGuard,
} from '../guards';
import { HasAccountGuard } from '../guards/has-account.guard';

interface RequiredAuthOptions {
  verifiedEmail?: true;
  hasAccount?: boolean;
  hasUserProfile?: boolean;
}

export function RequiredAuth(options: RequiredAuthOptions = {}) {
  const mergedOptions = {
    verifiedEmail: true,
    hasAccount: true,
    hasUserProfile: true,
    ...options,
  };

  const guards: Parameters<typeof UseGuards> = [];

  guards.push(FirebaseAuthGuard);

  if (mergedOptions.hasAccount === true) {
    guards.push(HasAccountGuard);
  }

  if (mergedOptions.hasUserProfile === true) {
    guards.push(HasUserProfileGuard);
  }

  if (mergedOptions.verifiedEmail) {
    guards.push(VerifiedEmailGuard);
  }

  const decorators: Parameters<typeof applyDecorators> = [UseGuards(...guards)];

  decorators.push(ApiBearerAuth());

  return applyDecorators(...decorators);
}
