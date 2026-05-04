import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { AccessDeniedError } from '@building-blocks/domain/domain-error';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-firebase-jwt';
import {
  AccountEntity,
} from '@domain/account/infrastructure';
import { AuthProvider, AuthUser } from './auth-provider';
import { UserProfileEntity } from '@domain/user-profile/infrastructure';
import { AccountFacade } from '@domain/account/account.facade';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase',
) {
  constructor(
    private readonly authService: AuthProvider,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepo: Repository<UserProfileEntity>,
    private readonly accountFacade: AccountFacade,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
  }

  async validate(_: Request, token: string): Promise<AuthUser> {
    if (!token || typeof token !== 'string') {
      throw new AccessDeniedError('No token provided');
    }

    const authUser = await this.authService.validateToken(token);

    const account = await this.fetchAccount(authUser.externalId);

    let userProfile = null;
    let hasPremiumEntitlement: boolean = false;
    if (account) {
      userProfile = await this.userProfileRepo.findOne({
        where: { accountId: account.id },
      });
      const getIsPremiumResult = await this.accountFacade.getIsPremiumAccount({
        accountId: account.id,
      });
      hasPremiumEntitlement = getIsPremiumResult.isPremium;
    }

    return {
      ...authUser,
      hasAccount: !!account,
      accountId: account ? account.id : '',
      hasUserProfile: !!userProfile,
      userProfileId: userProfile ? userProfile.id : '',
      hasPremiumEntitlement,
      email: authUser.email || '',
    };
  }

  private fetchAccount(authProviderId: string): Promise<AccountEntity | null> {
    return this.accountRepo.findOne({ where: { authProviderId } });
  }
}
