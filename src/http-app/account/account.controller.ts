import { Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser, RequiredAuth } from '../decorators';
import { AccountFacade } from '@domain/account/account.facade';
import { AuthUser } from '../authentication';
import { AccountDto } from './dto';
import { PurchaseFacade } from '@domain/purchase/purchase.facade';
import { AccountEntitlementsRefreshDto } from './dto/account-entitlements-refresh.dto';

@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountFacade: AccountFacade,
    private readonly purchaseFacade: PurchaseFacade,
  ) {}

  @RequiredAuth({
    hasAccount: false,
    hasUserProfile: false,
  })
  @Post('/me/sync')
  async syncAccount(@CurrentUser() authUser: AuthUser): Promise<AccountDto> {
    const account = await this.accountFacade.syncAccount({
      email: authUser.email,
      providerAuthId: authUser.externalId,
    });
    return AccountDto.fromEntity(account);
  }

  @RequiredAuth()
  @HttpCode(HttpStatus.OK)
  @Post('/me/entitlements/sync')
  async refreshSubscription(
    @CurrentUser() authUser: AuthUser,
  ): Promise<AccountEntitlementsRefreshDto> {
    const accountEntitlement =
      await this.purchaseFacade.refreshAccountEntitlements(authUser.accountId);
    return AccountEntitlementsRefreshDto.fromEntity(accountEntitlement);
  }

  @RequiredAuth({ hasUserProfile: false })
  @Delete('/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() authUser: AuthUser): Promise<void> {
    await this.accountFacade.deleteAccount({
      accountId: authUser.accountId,
    });
  }
}
