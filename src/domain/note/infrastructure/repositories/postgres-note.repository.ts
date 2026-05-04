import { InjectRepository } from '@nestjs/typeorm';
import {
  NoteRepository,
  Note,
  FindNoteByParams,
  NoteFilters,
  NoteCountFilters,
  FindNotesByProfileAndIdsParams,
} from '../../domain';
import { NoteEntity } from '../entities';
import { NoteMapper } from '../mappers/note.mapper';
import { And, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginatedList, Pagination } from '@building-blocks/application';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class PostgresNoteRepository implements NoteRepository {
  private readonly mapper = new NoteMapper();

  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    private readonly transactionManager: TransactionManager,
  ) {
  }

  async create(entity: Note, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(NoteEntity).save(mappedEntity);
    }, tx);
  }

  async findOneBy(params: FindNoteByParams): Promise<Note | null> {
    const noteEntity = await this.noteRepository.findOne({
      where: {
        id: params.id,
        userProfileId: params.userProfileId,
      },
    });
    return noteEntity ? this.mapper.toDomain(noteEntity) : null;
  }

  async findManyByProfileAndIds(
    params: FindNotesByProfileAndIdsParams,
  ): Promise<Record<string, Note | null>> {
    const notesEntities = await this.noteRepository.find({
      where: {
        userProfileId: params.userProfileId,
        id: In(params.notesIds),
      },
    });
    const mappedNotes = notesEntities.map((entity) =>
      this.mapper.toDomain(entity),
    );

    const dbNotesByIds = new Map<string, Note>();
    for (const mappedNote of mappedNotes) {
      dbNotesByIds.set(mappedNote.getId(), mappedNote);
    }

    return params.notesIds.reduce<Record<string, Note | null>>((acc, id) => {
      acc[id] = dbNotesByIds.get(id) ?? null;
      return acc;
    }, {});
  }

  async findLatestByUserProfileId(userProfileId: string): Promise<Note | null> {
    const noteEntity = await this.noteRepository.findOne({
      where: {
        userProfileId,
      },
      order: { createdAt: 'DESC' },
    });
    return noteEntity ? this.mapper.toDomain(noteEntity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.noteRepository.delete(id);
  }

  async update(entity: Note, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(NoteEntity).save(mappedEntity);
    }, tx);
  }

  async list(
    filters: NoteFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<Note>> {
    const where: FindOptionsWhere<NoteEntity> = {
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

    const [noteEntities, total] = await this.noteRepository.findAndCount({
      where,
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { createdAt: 'DESC' },
    });

    const items = noteEntities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async count(filters: NoteCountFilters): Promise<number> {
    const where: FindOptionsWhere<NoteEntity> = {
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

    return this.noteRepository.count({
      where,
    });
  }
}
