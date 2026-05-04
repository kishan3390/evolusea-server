import { InjectRepository } from '@nestjs/typeorm';
import { And, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CompassChatCountFilters, FindCompassChatByParams } from '../../domain';
import {
  CompassChatFilters,
  CompassChatRepository,
} from '@domain/compass/domain/repositories/compass-chat.repository';
import { CompassChat } from '@domain/compass/domain/compass-chat';
import { CompassChatMapper } from '@domain/compass/infrastructure/mappers/compass-chat.mapper';
import { CompassChatEntity } from '@domain/compass/infrastructure/entities/compass-chat.entity';
import { Pagination, PaginatedList } from '@building-blocks/application';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';

@Injectable()
export class PostgresCompassChatRepository implements CompassChatRepository {
  private readonly mapper = new CompassChatMapper();

  constructor(
    @InjectRepository(CompassChatEntity)
    private readonly compassChatRepository: Repository<CompassChatEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: CompassChat, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(CompassChatEntity).save(mappedEntity);
    }, tx);
  }

  async findOneBy(
    params: FindCompassChatByParams,
  ): Promise<CompassChat | null> {
    const entity = await this.compassChatRepository.findOne({
      where: {
        id: params.compassChatId,
        userProfileId: params.userProfileId,
      },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async list(
    filters: CompassChatFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<CompassChat>> {
    const query: FindOptionsWhere<CompassChatEntity> = {
      userProfileId: filters.userProfileId,
    };

    if (filters.status) {
      query.status = filters.status;
    }

    const [entities, total] = await this.compassChatRepository.findAndCount({
      where: query,
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { createdAt: 'DESC' },
    });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async count(filters: CompassChatCountFilters): Promise<number> {
    const where: FindOptionsWhere<CompassChatEntity> = {
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

    return this.compassChatRepository.count({
      where,
    });
  }

  async update(entity: CompassChat, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(CompassChatEntity).save(mappedEntity);
    }, tx);
  }

  async delete(id: string): Promise<void> {
    await this.compassChatRepository.delete(id);
  }
}
