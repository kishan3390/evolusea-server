import { FirebaseAuth } from '@firebase/firebase-auth';
import { Inject, Injectable } from '@nestjs/common';
import { Auth, DecodedIdToken } from 'firebase-admin/auth';
import { AccessDeniedError } from '@building-blocks/domain/domain-error';
import { AuthProvider, DecodedAuthToken } from './auth-provider';

@Injectable()
export class FirebaseAuthProvider implements AuthProvider {
  constructor(@Inject(FirebaseAuth) private readonly firebaseAuth: Auth) {}

  async validateToken(token: string): Promise<DecodedAuthToken> {
    const claims = await this.getClaims(token);

    const isAnonymous = claims.firebase.sign_in_provider === 'anonymous';

    const isEmailVerified = claims.email_verified ?? true;

    return {
      externalId: claims.sub,
      email: claims.email,
      customClaims: claims.customClaims,
      isAnonymous,
      isEmailVerified,
    };
  }

  private async getClaims(token: string): Promise<DecodedIdToken> {
    try {
      return await this.firebaseAuth.verifyIdToken(token);
    } catch (err) {
      throw new AccessDeniedError('Invalid or expired token');
    }
  }
}
