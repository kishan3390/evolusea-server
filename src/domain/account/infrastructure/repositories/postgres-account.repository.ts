import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRepository, Account } from '../../domain';
import { AccountMapper } from '../account.mapper';
import { AccountEntity } from '../entities';
import { Pagination, PaginatedList } from '@building-blocks/application';

@Injectable()
export class PostgresAccountRepository implements AccountRepository {
  private readonly mapper = new AccountMapper();

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async list(pagination: Pagination): Promise<PaginatedList<Account>> {
    const [entities, total] = await this.accountRepository.findAndCount({
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { createdAt: 'ASC' },
    });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async create(entity: Account): Promise<void> {
    await this.accountRepository.save(this.mapper.toPersistence(entity));
  }

  async getByAuthProviderId(
    authProviderId: string,
  ): Promise<Account | undefined> {
    const result = await this.accountRepository.findOne({
      where: { authProviderId },
    });
    if (!result) {
      return undefined;
    }

    return this.mapper.toDomain(result);
  }

  async getById(accountId: string): Promise<Account | null> {
    const result = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!result) {
      return null;
    }

    return this.mapper.toDomain(result);
  }

  async delete(accountId: string): Promise<void> {
    await this.accountRepository.delete(accountId);
  }
}
