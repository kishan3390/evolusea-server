import { Mapper } from '../../../building-blocks/infrastructure';
import { Account } from '../domain/account';
import { AccountEntity } from './entities/account.entity';

export class AccountMapper implements Mapper<Account, AccountEntity> {
  toDomain(entity: AccountEntity): Account {
    return new Account({
      id: entity.id,
      email: entity.email,
      authProviderId: entity.authProviderId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Account): AccountEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      email: props.email,
      authProviderId: props.authProviderId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
