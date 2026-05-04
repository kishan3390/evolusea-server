import { Injectable } from '@nestjs/common';
import {
  FindManyWisdomStoriesByProfileAndIdsParams,
  FindWisdomStoryByParams,
  WisdomStory,
  WisdomStoryListFilters,
  WisdomStoryRepository,
  WisdomStorySort,
} from '../../domain';
import { WisdomStoryMapper } from '../wisdom-story.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { WisdomStoryEntity, WisdomStoryTranslationEntity } from '../entities';
import { Repository, In, FindOptionsOrder } from 'typeorm';
import { PaginatedList, Pagination } from '@building-blocks/application';
import { WisdomStoryTranslationMapper } from '../wisdom-story-translation.mapper';
import { TransactionManager } from '@building-blocks/infrastructure';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class PostgresWisdomStoryRepository implements WisdomStoryRepository {
  private readonly mapper = new WisdomStoryMapper();
  private readonly translationMapper = new WisdomStoryTranslationMapper();

  constructor(
    @InjectRepository(WisdomStoryEntity)
    private readonly wisdomStoryRepository: Repository<WisdomStoryEntity>,
    @InjectRepository(WisdomStoryTranslationEntity)
    private readonly wisdomStoryTranslationRepository: Repository<WisdomStoryTranslationEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: WisdomStory): Promise<void> {
    await this.transactionManager.execute(async (tx) => {
      const wisdomStoryEntity = this.mapper.toPersistence(entity);
      await tx.getRepository(WisdomStoryEntity).save(wisdomStoryEntity);

      // Save translations
      const translations = entity.getTranslations();
      if (translations.length > 0) {
        const translationEntities = translations.map((translation) =>
          this.translationMapper.toPersistence(translation),
        );
        await tx
          .getRepository(WisdomStoryTranslationEntity)
          .save(translationEntities);
      }
    });
  }

  async findOneById(id: string): Promise<WisdomStory | null> {
    const wisdomStoryEntity = await this.wisdomStoryRepository.findOne({
      where: { id },
    });
    if (!wisdomStoryEntity) {
      return null;
    }
    const wisdomStory = this.mapper.toDomain(wisdomStoryEntity);
    const translations = await this.wisdomStoryTranslationRepository.find({
      where: { wisdomStoryId: id },
    });
    for (const translationEntity of translations) {
      wisdomStory.addTranslation(
        this.translationMapper.toDomain(translationEntity),
      );
    }
    return wisdomStory;
  }

  async findOneBy(
    params: FindWisdomStoryByParams,
  ): Promise<WisdomStory | null> {
    const where: any = {};
    if (params.cmsId) {
      where.CMSId = params.cmsId;
    }

    const wisdomStoryEntity = await this.wisdomStoryRepository.findOne({
      where,
    });

    if (!wisdomStoryEntity) {
      return null;
    }

    const wisdomStory = this.mapper.toDomain(wisdomStoryEntity);
    const translations = await this.wisdomStoryTranslationRepository.find({
      where: { wisdomStoryId: wisdomStoryEntity.id },
    });
    for (const translationEntity of translations) {
      wisdomStory.addTranslation(
        this.translationMapper.toDomain(translationEntity),
      );
    }
    return wisdomStory;
  }

  async findManyByProfileAndIds(
    params: FindManyWisdomStoriesByProfileAndIdsParams,
  ): Promise<Record<string, WisdomStory | null>> {
    const storiesEntities = await this.wisdomStoryRepository.find({
      where: {
        id: In(params.wisdomStoriesIds),
      },
    });

    const translationsByStoryId = new Map<string, WisdomStoryTranslationEntity[]>();
    if (storiesEntities.length > 0) {
      const wisdomStoryIds = storiesEntities.map((entity) => entity.id);
      const translationEntities = await this.wisdomStoryTranslationRepository.find({
        where: {
          wisdomStoryId: In(wisdomStoryIds),
        },
      });

      for (const translation of translationEntities) {
        const translations =
          translationsByStoryId.get(translation.wisdomStoryId) || [];
        translations.push(translation);
        translationsByStoryId.set(translation.wisdomStoryId, translations);
      }
    }

    const dbStoriesByIds = new Map<string, WisdomStory>();
    for (const entity of storiesEntities) {
      const mappedStory = this.mapper.toDomain(entity);
      const translations = translationsByStoryId.get(entity.id) || [];
      for (const translationEntity of translations) {
        mappedStory.addTranslation(
          this.translationMapper.toDomain(translationEntity),
        );
      }
      dbStoriesByIds.set(mappedStory.getId(), mappedStory);
    }

    return params.wisdomStoriesIds.reduce<Record<string, WisdomStory | null>>(
      (acc, id) => {
        acc[id] = dbStoriesByIds.get(id) ?? null;
        return acc;
      },
      {},
    );
  }

  async findAll(): Promise<WisdomStory[]> {
    const entities = await this.wisdomStoryRepository.find();

    if (entities.length === 0) {
      return [];
    }

    const wisdomStoryIds = entities.map((entity) => entity.id);
    const allTranslations = await this.wisdomStoryTranslationRepository.find({
      where: {
        wisdomStoryId: In(wisdomStoryIds),
      },
    });

    const translationsByStoryId = new Map<
      string,
      WisdomStoryTranslationEntity[]
    >();
    for (const translation of allTranslations) {
      const existing =
        translationsByStoryId.get(translation.wisdomStoryId) || [];
      existing.push(translation);
      translationsByStoryId.set(translation.wisdomStoryId, existing);
    }

    return entities.map((entity) => {
      const wisdomStory = this.mapper.toDomain(entity);
      const translations = translationsByStoryId.get(entity.id) || [];
      for (const translationEntity of translations) {
        wisdomStory.addTranslation(
          this.translationMapper.toDomain(translationEntity),
        );
      }
      return wisdomStory;
    });
  }

  async delete(id: string): Promise<void> {
    await this.wisdomStoryRepository.delete(id);
  }

  async update(entity: WisdomStory): Promise<void> {
    await this.transactionManager.execute(async (tx) => {
      const wisdomStoryEntity = this.mapper.toPersistence(entity);
      await tx.getRepository(WisdomStoryEntity).save(wisdomStoryEntity);

      // Delete existing translations and save new ones
      await tx.getRepository(WisdomStoryTranslationEntity).delete({
        wisdomStoryId: entity.getId(),
      });

      const translations = entity.getTranslations();
      if (translations.length > 0) {
        const translationEntities = translations.map((translation) =>
          this.translationMapper.toPersistence(translation),
        );
        await tx
          .getRepository(WisdomStoryTranslationEntity)
          .save(translationEntities);
      }
    });
  }

  async list(
    filters: WisdomStoryListFilters,
    pagination: Pagination,
    sorts: WisdomStorySort[],
  ): Promise<PaginatedList<WisdomStory>> {
    const order = sorts.reduce<FindOptionsOrder<WisdomStoryEntity>>(
      (acc, sort) => {
        acc[sort.field] = sort.direction;
        return acc;
      },
      {},
    );

    const where: FindOptionsWhere<WisdomStoryEntity> = {};
    if (filters.isFree === true || filters.isFree === false) {
      where.isFree = filters.isFree;
    }

    if (filters.beliefsSystems?.length) {
      where.beliefSystem = In(filters.beliefsSystems);
    }

    const [entities, total] = await this.wisdomStoryRepository.findAndCount({
      where,
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order,
    });

    if (entities.length === 0) {
      return pagination.getPaginatedList([], total);
    }

    const wisdomStoryIds = entities.map((entity) => entity.id);
    const allTranslations = await this.wisdomStoryTranslationRepository.find({
      where: {
        wisdomStoryId: In(wisdomStoryIds),
      },
    });

    const translationsByStoryId = new Map<
      string,
      WisdomStoryTranslationEntity[]
    >();
    for (const translation of allTranslations) {
      const existing =
        translationsByStoryId.get(translation.wisdomStoryId) || [];
      existing.push(translation);
      translationsByStoryId.set(translation.wisdomStoryId, existing);
    }

    const items = entities.map((entity) => {
      const wisdomStory = this.mapper.toDomain(entity);
      const translations = translationsByStoryId.get(entity.id) || [];
      for (const translationEntity of translations) {
        wisdomStory.addTranslation(
          this.translationMapper.toDomain(translationEntity),
        );
      }
      return wisdomStory;
    });

    return pagination.getPaginatedList(items, total);
  }
}
