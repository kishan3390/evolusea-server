import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Pagination, PaginatedList } from '@building-blocks/application';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import {
  CompassChatSummaryFilters,
  CompassChatSummaryRepository,
  FindCompassChatSummaryByParams,
} from '@domain/compass/domain/repositories/compass-chat-summary.repository';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';
import { CompassChatSummaryEntity } from '@domain/compass/infrastructure/entities/compass-chat-summary.entity';
import { CompassChatSummaryMapper } from '@domain/compass/infrastructure/mappers/compass-chat-summary.mapper';

@Injectable()
export class PostgresCompassChatSummaryRepository
  implements CompassChatSummaryRepository
{
  private readonly mapper = new CompassChatSummaryMapper();

  constructor(
    @InjectRepository(CompassChatSummaryEntity)
    private readonly compassChatSummaryRepository: Repository<CompassChatSummaryEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: CompassChatSummary, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx
        .getRepository(CompassChatSummaryEntity)
        .save(mappedEntity);
    }, tx);
  }

  async findOneBy(
    params: FindCompassChatSummaryByParams,
  ): Promise<CompassChatSummary | null> {
    const entity = await this.compassChatSummaryRepository.findOne({
      where: {
        compassChatId: params.compassChatId,
      },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async list(
    filters: CompassChatSummaryFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<CompassChatSummary>> {
    const query: FindOptionsWhere<CompassChatSummaryEntity> = {
      compassChat: {
        userProfileId: filters.userProfileId,
      }
    };

    const [entities, total] =
      await this.compassChatSummaryRepository.findAndCount({
        where: query,
        skip: pagination.getOffset(),
        take: pagination.getPerPage(),
        order: { createdAt: 'DESC' },
        relations: ['compassChat'],
      });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async update(entity: CompassChatSummary, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(CompassChatSummaryEntity).save(mappedEntity);
    }, tx);
  }

  async delete(id: string): Promise<void> {
    await this.compassChatSummaryRepository.delete(id);
  }
}
