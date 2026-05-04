import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { EntityIdGenerator } from '@building-blocks/domain';

import { AccountEntitlementRepository } from '@domain/account/domain/repositories';
import { AccountEntitlement } from '@domain/account/domain/account-entitlement';
import { UpsertAccountEntitlementCommand } from '@domain/account/application/commands/upsert-account-entitlement/upsert-account-entitlement.command';

@Injectable()
export class UpsertAccountEntitlementCommandHandler
  implements CommandHandler<UpsertAccountEntitlementCommand, void>
{
  constructor(
    private readonly accountEntitlementRepository: AccountEntitlementRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {}

  async handle(command: UpsertAccountEntitlementCommand): Promise<void> {
    const accountEntitlement = AccountEntitlement.create({
      type: command.type,
      accountId: command.accountId,
      purchasedAt: command.purchasedAt,
      expiresAt: command.expiresAt,
      entityIdGenerator: this.entityIdGenerator,
    });
    await this.accountEntitlementRepository.upsert(accountEntitlement);
  }
}
