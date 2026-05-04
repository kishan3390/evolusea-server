import { Injectable } from '@nestjs/common';
import { AuthProvider, DecodedAuthToken } from './auth-provider';
import { v4 as uuid } from 'uuid';
import { AccessDeniedError } from '../../building-blocks/domain';

type FakeUser = {
  uid: string;
  email: string;
  emailVerified: boolean;
};

@Injectable()
export class FakeAuthProvider implements AuthProvider {
  private users = new Map<string, FakeUser>();

  async validateToken(token: string): Promise<DecodedAuthToken> {
    const user = this.users.get(token); // token is just uid here
    if (!user) throw new AccessDeniedError('Invalid or expired token');

    return {
      externalId: user.uid,
      email: user.email,
      isAnonymous: false,
      isEmailVerified: user.emailVerified,
    };
  }

  registerUser(email: string, emailVerified: boolean = false): string {
    const uid = uuid();
    this.users.set(uid, { uid, email, emailVerified });
    return uid;
  }

  getAccessToken(uid: string): string {
    if (this.users.has(uid)) {
      return uid; // token = uid for fake provider
    }
    throw firebaseError('auth/user-not-found', `No user with uid: ${uid}`);
  }
}

const firebaseError = (code: string, message: string): Error => {
  const err: Error & { code?: string } = new Error(message);
  err.code = code;
  return err;
};
