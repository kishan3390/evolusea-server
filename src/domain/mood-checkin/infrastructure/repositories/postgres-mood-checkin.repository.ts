import { InjectRepository } from '@nestjs/typeorm';
import {
  MoodCheckinRepository,
  MoodCheckin,
  MoodCheckinFilters,
} from '../../domain';
import { MoodCheckinEntity } from '../entities';
import { MoodCheckinMapper } from '../mappers/mood-checkin.mapper';
import { And, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginatedList, Pagination } from '@building-blocks/application';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class PostgresMoodCheckinRepository implements MoodCheckinRepository {
  private readonly mapper = new MoodCheckinMapper();

  constructor(
    @InjectRepository(MoodCheckinEntity)
    private readonly moodCheckinRepository: Repository<MoodCheckinEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: MoodCheckin, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(MoodCheckinEntity).save(mappedEntity);
    }, tx);
  }

  async findLatestByUserProfileId(
    userProfileId: string,
  ): Promise<MoodCheckin | null> {
    const entity = await this.moodCheckinRepository.findOne({
      where: { userProfileId },
      order: { createdAt: 'DESC' },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async list(
    filters: MoodCheckinFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<MoodCheckin>> {
    const where: FindOptionsWhere<MoodCheckinEntity> = {
      userProfileId: filters.userProfileId,
    };

    if (filters.createdFrom && filters.createdTo) {
      where.createdAt = And(
        MoreThanOrEqual(filters.createdFrom),
        LessThanOrEqual(filters.createdTo),
      );
    } else if (filters.createdFrom) {
      where.createdAt = MoreThanOrEqual(filters.createdFrom);
    } else if (filters.createdTo) {
      where.createdAt = LessThanOrEqual(filters.createdTo);
    }

    const [entities, total] = await this.moodCheckinRepository.findAndCount({
      where,
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { createdAt: 'DESC' },
    });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }
}
