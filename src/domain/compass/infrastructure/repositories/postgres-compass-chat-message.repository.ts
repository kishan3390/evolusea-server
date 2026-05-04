import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  CompassChatMessage,
  CompassChatMessageFilters,
  CompassChatMessageSort,
  FindCompassChatMessageByParams,
} from '../../domain';
import { Pagination, PaginatedList } from '@building-blocks/application';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { CompassChatMessageMapper } from '../mappers/compass-chat-message.mapper';
import { CompassChatMessageRepository } from '@domain/compass/domain';
import { CompassChatMessageEntity } from '../entities/compass-chat-message.entity';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';

@Injectable()
export class PostgresCompassChatMessageRepository
  implements CompassChatMessageRepository
{
  private readonly mapper = new CompassChatMessageMapper();

  constructor(
    @InjectRepository(CompassChatMessageEntity)
    private readonly compassChatMessageRepository: Repository<CompassChatMessageEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: CompassChatMessage, tx?: Transaction): Promise<void> {
    await this.createMany([entity], tx);
  }

  async createMany(
    entities: CompassChatMessage[],
    tx?: Transaction,
  ): Promise<void> {
    const mappedEntities = entities.map((entity) =>
      this.mapper.toPersistence(entity),
    );

    await this.transactionManager.execute(async (internalTx) => {
      await internalTx
        .getRepository(CompassChatMessageEntity)
        .save(mappedEntities);
    }, tx);
  }

  async findOneBy(
    params: FindCompassChatMessageByParams,
  ): Promise<CompassChatMessage | null> {
    const entity = await this.compassChatMessageRepository.findOne({
      where: {
        id: params.id,
        compassChatId: params.compassChatId,
      },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async list(
    filters: CompassChatMessageFilters,
    pagination: Pagination,
    sorts: CompassChatMessageSort[],
  ): Promise<PaginatedList<CompassChatMessage>> {
    const query: FindOptionsWhere<CompassChatMessageEntity> = {
      compassChatId: filters.compassChatId,
    };

    if (filters.visibility) {
      query.visibility = filters.visibility;
    }

    const order = sorts.reduce<FindOptionsOrder<CompassChatMessageEntity>>(
      (acc, sort) => {
        acc[sort.field] = sort.direction;
        return acc;
      },
      {},
    );

    const [entities, total] =
      await this.compassChatMessageRepository.findAndCount({
        where: query,
        skip: pagination.getOffset(),
        take: pagination.getPerPage(),
        order,
      });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async update(entity: CompassChatMessage): Promise<void> {
    await this.compassChatMessageRepository.save(
      this.mapper.toPersistence(entity),
    );
  }

  async delete(id: string): Promise<void> {
    await this.compassChatMessageRepository.delete(id);
  }
}
