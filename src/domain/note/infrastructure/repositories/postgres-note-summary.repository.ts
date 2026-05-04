import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import {
  FindNoteSummaryByParams,
  NoteSummaryFilters,
  NoteSummaryRepository,
} from '@domain/note/domain';
import { NoteSummaryMapper } from '@domain/note/infrastructure/mappers/note-summary.mapper';
import { NoteSummary } from '@domain/note/domain/note-summary';
import { NoteSummaryEntity } from '@domain/note/infrastructure/entities/note-summary.entity';
import { Pagination, PaginatedList } from '@building-blocks/application';

@Injectable()
export class PostgresNoteSummaryRepository implements NoteSummaryRepository {
  private readonly mapper = new NoteSummaryMapper();

  constructor(
    @InjectRepository(NoteSummaryEntity)
    private readonly noteSummaryRepository: Repository<NoteSummaryEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: NoteSummary, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(NoteSummaryEntity).save(mappedEntity);
    }, tx);
  }

  async list(
    filters: NoteSummaryFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<NoteSummary>> {
    const [entities, total] = await this.noteSummaryRepository.findAndCount({
      where: {
        note: {
          userProfileId: filters.userProfileId,
        },
      },
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { createdAt: 'DESC' },
      relations: ['note'],
    });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async findOneBy(
    params: FindNoteSummaryByParams,
  ): Promise<NoteSummary | null> {
    const entity = await this.noteSummaryRepository.findOne({
      where: {
        noteId: params.noteId,
      },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async update(entity: NoteSummary, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(NoteSummaryEntity).save(mappedEntity);
    }, tx);
  }

  async upsertByNoteId(entity: NoteSummary, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx
        .getRepository(NoteSummaryEntity)
        .createQueryBuilder()
        .insert()
        .into(NoteSummaryEntity)
        .values(mappedEntity)
        .orUpdate(['content', 'updated_at'], ['note_id'])
        .execute();
    }, tx);
  }

  async delete(id: string): Promise<void> {
    await this.noteSummaryRepository.delete(id);
  }
}
