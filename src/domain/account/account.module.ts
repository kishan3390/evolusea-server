import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './infrastructure/entities/account.entity';
import { AccountFacade } from './account.facade';
import { AccountRepository } from './domain';
import { PostgresAccountRepository } from './infrastructure';
import { SynchronizeAccountCommandHandler } from './application/commands/synchronize-account';
import {
  GetAccountByIdQueryHandler,
  ListAccountsQueryHandler,
} from '@domain/account/application/queries';
import { PostgresAccountEntitlementRepository } from '@domain/account/infrastructure/repositories/postgres-account-entitlement.repository';
import { AccountEntitlementEntity } from '@domain/account/infrastructure/entities/account-entitlement.entity';
import { AccountEntitlementRepository } from '@domain/account/domain/repositories';
import { ReplaceEntitlementsCommandHandler } from '@domain/account/application/commands/replace-entitlements/replace-entitlements.command-handler';
import { UpsertAccountEntitlementCommandHandler } from '@domain/account/application';
import { GetIsPremiumAccountQueryHandler } from '@domain/account/application/queries/get-is-premium-account/get-is-premium-account.query-handler';
import { DeleteAccountCommandHandler } from '@domain/account/application';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, AccountEntitlementEntity]),
  ],
  providers: [
    {
      provide: AccountRepository,
      useClass: PostgresAccountRepository,
    },
    {
      provide: AccountEntitlementRepository,
      useClass: PostgresAccountEntitlementRepository,
    },
    SynchronizeAccountCommandHandler,
    GetAccountByIdQueryHandler,
    AccountFacade,
    ReplaceEntitlementsCommandHandler,
    ListAccountsQueryHandler,
    UpsertAccountEntitlementCommandHandler,
    GetIsPremiumAccountQueryHandler,
    DeleteAccountCommandHandler,
  ],
  exports: [AccountFacade],
})
export class AccountModule {}
