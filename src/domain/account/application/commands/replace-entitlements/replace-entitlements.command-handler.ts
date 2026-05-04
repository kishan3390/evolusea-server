import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, Pagination } from '@building-blocks/application';
import { EntityIdGenerator } from '@building-blocks/domain';
import {
  ReplaceEntitlementsCommand,
  ReplaceEntitlementsCommandEntry,
} from '@domain/account/application/commands/replace-entitlements/replace-entitlements.command';
import { EntitlementsTypes } from '@domain/account/domain/enums';
import { AccountEntitlementRepository } from '@domain/account/domain/repositories';
import { AccountEntitlement } from '@domain/account/domain/account-entitlement';

@Injectable()
export class ReplaceEntitlementsCommandHandler
  implements CommandHandler<ReplaceEntitlementsCommand, void>
{
  private logger: Logger;

  constructor(
    private readonly accountEntitlementRepository: AccountEntitlementRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {
    this.logger = new Logger(ReplaceEntitlementsCommandHandler.name);
  }

  async handle(command: ReplaceEntitlementsCommand): Promise<void> {
    const dbEntitlements = await this.accountEntitlementRepository.list(
      {
        accountId: command.accountId,
      },
      Pagination.unlimited(),
    );

    for (const entitlementType of Object.keys(command.entitlements)) {
      if (
        !Object.values(EntitlementsTypes).includes(
          entitlementType as EntitlementsTypes,
        )
      ) {
        this.logger.error(
          `Unknown entitlement type '${entitlementType}' for account '${command.accountId}'`,
        );
      }
    }

    await this.refreshEntitlements(command, dbEntitlements.items);
  }

  private async refreshEntitlements(
    command: ReplaceEntitlementsCommand,
    dbEntitlements: AccountEntitlement[],
  ) {
    const dbEntitlementsMap = {} as Record<
      EntitlementsTypes,
      AccountEntitlement
    >;
    const entitlementsMarkedToDelete = {} as Record<EntitlementsTypes, boolean>;

    for (const entitlement of dbEntitlements) {
      const type = entitlement.getType();
      dbEntitlementsMap[type] = entitlement;
      entitlementsMarkedToDelete[type] = true;
    }

    for (const [type, newEntitlement] of Object.entries(
      command.entitlements,
    ) as [EntitlementsTypes, ReplaceEntitlementsCommandEntry][]) {
      if (entitlementsMarkedToDelete[type]) {
        entitlementsMarkedToDelete[type] = false;
      }

      const accountPremiumEntitlement = AccountEntitlement.create({
        accountId: command.accountId,
        purchasedAt: newEntitlement.purchasedAt,
        expiresAt: newEntitlement.expiresAt,
        type,
        entityIdGenerator: this.entityIdGenerator,
      });
      await this.accountEntitlementRepository.upsert(accountPremiumEntitlement);
    }

    for (const [type, shouldDelete] of Object.entries(
      entitlementsMarkedToDelete,
    )) {
      if (!shouldDelete) {
        continue;
      }

      const entitlementId =
        dbEntitlementsMap[type as EntitlementsTypes].getId();
      await this.accountEntitlementRepository.delete(entitlementId);
    }
  }
}
