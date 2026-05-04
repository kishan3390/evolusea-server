export interface AuthUser {
  externalId: string;
  email: string;
  customClaims?: Record<string, unknown>;
  isAnonymous: boolean;
  isEmailVerified: boolean;
  accountId: string;
  hasAccount: boolean;
  hasUserProfile: boolean;
  userProfileId: string;
  hasPremiumEntitlement: boolean;
}

export interface DecodedAuthToken {
  externalId: string;
  email?: string;
  customClaims?: Record<string, unknown>;
  isAnonymous: boolean;
  isEmailVerified: boolean;
}

export abstract class AuthProvider {
  abstract validateToken(token: string): Promise<DecodedAuthToken>;
}
