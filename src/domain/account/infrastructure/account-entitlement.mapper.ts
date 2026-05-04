import { Mapper } from '@building-blocks/infrastructure';
import { AccountEntitlementEntity } from './entities/account-entitlement.entity';
import { AccountEntitlement } from '../domain/account-entitlement';

export class AccountEntitlementMapper
  implements Mapper<AccountEntitlement, AccountEntitlementEntity>
{
  toDomain(entity: AccountEntitlementEntity): AccountEntitlement {
    return new AccountEntitlement({
      id: entity.id,
      accountId: entity.accountId,
      type: entity.type,
      purchasedAt: entity.purchasedAt,
      expiresAt: entity.expiresAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: AccountEntitlement): AccountEntitlementEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      accountId: domain.getAccountId(),
      type: domain.getType(),
      purchasedAt: domain.getPurchasedAt(),
      expiresAt: domain.getExpiresAt(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
