import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedList, Pagination } from '@building-blocks/application';
import {
  QuotePoolItem,
  QuotePoolRepository,
  QuotePoolFilters,
  QuotePoolMoods,
} from '../../domain';
import { QuotePoolEntity } from '../entities';
import { QuotePoolMapper } from '../mappers/quote-pool.mapper';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';

@Injectable()
export class PostgresQuotePoolRepository implements QuotePoolRepository {
  private readonly mapper = new QuotePoolMapper();

  constructor(
    @InjectRepository(QuotePoolEntity)
    private readonly repository: Repository<QuotePoolEntity>,
  ) {}

  async findOneById(id: string): Promise<QuotePoolItem | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findRandomByFilter(
    beliefSystems: BeliefSystems[],
    mood: QuotePoolMoods,
    language: Languages,
    limit: number,
    excludeIds: string[],
  ): Promise<QuotePoolItem[]> {
    const qb = this.repository
      .createQueryBuilder('qp')
      .where('qp.belief_system IN (:...beliefSystems)', { beliefSystems })
      .andWhere('qp.mood = :mood', { mood })
      .andWhere('qp.language = :language', { language });

    if (excludeIds.length > 0) {
      qb.andWhere('qp.id NOT IN (:...excludeIds)', { excludeIds });
    }

    qb.orderBy('RANDOM()').limit(limit);

    const entities = await qb.getMany();
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async list(
    pagination: Pagination,
    filters?: QuotePoolFilters,
  ): Promise<PaginatedList<QuotePoolItem>> {
    const where: Record<string, unknown> = {};
    if (filters?.mood) {
      where.mood = filters.mood;
    }
    if (filters?.beliefSystem) {
      where.beliefSystem = filters.beliefSystem;
    }
    if (filters?.language) {
      where.language = filters.language;
    }

    const [entities, total] = await this.repository.findAndCount({
      where,
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: { attribution: 'ASC', content: 'ASC' },
    });

    const items = entities.map((e) => this.mapper.toDomain(e));
    return pagination.getPaginatedList(items, total);
  }

  async count(filters?: QuotePoolFilters): Promise<number> {
    const where: Record<string, unknown> = {};
    if (filters?.mood) {
      where.mood = filters.mood;
    }
    if (filters?.beliefSystem) {
      where.beliefSystem = filters.beliefSystem;
    }
    if (filters?.language) {
      where.language = filters.language;
    }

    return this.repository.count({ where });
  }
}
