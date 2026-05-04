import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionManager } from '@building-blocks/infrastructure';

import { UserProfileEntity } from '../entities';
import { UserProfileMapper } from '../user-profile.mapper';
import { UserProfile, UserProfileRepository } from '../../domain';

@Injectable()
export class PostgresUserProfileRepository implements UserProfileRepository {
  private readonly mapper = new UserProfileMapper();
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: UserProfile): Promise<void> {
    await this.userProfileRepository.save(this.mapper.toPersistence(entity));
  }

  async getByAccountId(accountId: string): Promise<UserProfile | undefined> {
    const result = await this.userProfileRepository.findOne({
      where: { accountId },
    });
    if (!result) {
      return undefined;
    }

    return this.mapper.toDomain(result);
  }

  async getById(id: string): Promise<UserProfile | undefined> {
    const result = await this.userProfileRepository.findOne({ where: { id } });
    if (!result) {
      return undefined;
    }

    return this.mapper.toDomain(result);
  }

  async list(page: number, perPage: number): Promise<UserProfile[]> {
    const results = await this.userProfileRepository.find({
      skip: (page - 1) * perPage,
      take: perPage,
      order: { createdAt: 'ASC' },
    });
    return results.map((result) => this.mapper.toDomain(result));
  }

  async update(entity: UserProfile): Promise<void> {
    await this.userProfileRepository.save(this.mapper.toPersistence(entity));
  }

  async delete(accountId: string): Promise<void> {
    await this.userProfileRepository.delete(accountId);
  }
}
