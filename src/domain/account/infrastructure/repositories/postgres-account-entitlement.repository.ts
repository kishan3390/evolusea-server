import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginatedList, Pagination } from '@building-blocks/application';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import { AccountEntitlementMapper } from '../account-entitlement.mapper';
import { AccountEntitlementEntity } from '../entities/account-entitlement.entity';
import {
  AccountEntitlementFilters,
  AccountEntitlementRepository,
  FindAccountEntitlementByAccountIdAndType,
} from '@domain/account/domain/repositories';
import { AccountEntitlement } from '@domain/account/domain/account-entitlement';

@Injectable()
export class PostgresAccountEntitlementRepository
  implements AccountEntitlementRepository
{
  private readonly mapper = new AccountEntitlementMapper();

  constructor(
    @InjectRepository(AccountEntitlementEntity)
    private readonly noteRepository: Repository<AccountEntitlementEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: AccountEntitlement, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx
        .getRepository(AccountEntitlementEntity)
        .save(mappedEntity);
    }, tx);
  }

  async findOneByAccountIdAndType(
    params: FindAccountEntitlementByAccountIdAndType,
  ): Promise<AccountEntitlement | null> {
    const entity = await this.noteRepository.findOne({
      where: {
        accountId: params.accountId,
        type: params.type,
      },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async delete(accountEntitlementId: string): Promise<void> {
    await this.noteRepository.delete(accountEntitlementId);
  }

  async update(entity: AccountEntitlement, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx
        .getRepository(AccountEntitlementEntity)
        .save(mappedEntity);
    }, tx);
  }

  async upsert(entity: AccountEntitlement, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx
        .getRepository(AccountEntitlementEntity)
        .createQueryBuilder()
        .insert()
        .into(AccountEntitlementEntity)
        .values(mappedEntity)
        .orUpdate(
          [
            'expires_at',
            'updated_at',
          ],
          ['account_id', 'type'],
        )
        .execute();
    }, tx);
  }

  async list(
    filters: AccountEntitlementFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<AccountEntitlement>> {
    const [noteEntities, total] = await this.noteRepository.findAndCount({
      where: {
        accountId: filters.accountId,
      },
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { createdAt: 'DESC' },
    });

    const items = noteEntities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }
}
