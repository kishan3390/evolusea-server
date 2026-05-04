import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyPathsByParams,
  FindManyPathsByProfileAndIdsParams,
  FindPathByParams,
  Path,
  PathCountFilters,
  PathFilters,
  PathRepository,
} from '../../domain';
import { PathMapper } from '../path.mapper';
import { PathEntity } from '../entities';
import {
  And,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginatedList, Pagination } from '@building-blocks/application';

@Injectable()
export class PostgresPathRepository implements PathRepository {
  private readonly mapper = new PathMapper();

  constructor(
    @InjectRepository(PathEntity)
    private readonly pathRepository: Repository<PathEntity>,
  ) {}

  async create(entity: Path): Promise<void> {
    await this.pathRepository.save(this.mapper.toPersistence(entity));
  }

  async findOneBy(params: FindPathByParams): Promise<Path | null> {
    const pathEntity = await this.pathRepository.findOne({
      where: {
        id: params.id,
        userProfileId: params.userProfileId,
      },
    });
    return pathEntity ? this.mapper.toDomain(pathEntity) : null;
  }

  async findManyBy(params: FindManyPathsByParams): Promise<Path[]> {
    const { status, isScheduledBefore, isScheduledAt } = params;

    const where: FindOptionsWhere<PathEntity> = {};

    if (status) {
      where.status = status;
    }

    if (isScheduledBefore) {
      where.date = LessThan(isScheduledBefore.toISOString().split('T')[0]);
    }

    if (isScheduledAt) {
      where.date = isScheduledAt;
    }

    const pathEntities = await this.pathRepository.find({
      where,
    });
    return pathEntities.map((entity) => this.mapper.toDomain(entity));
  }

  async findManyByProfileAndIds(
    params: FindManyPathsByProfileAndIdsParams,
  ): Promise<Record<string, Path | null>> {
    const pathEntities = await this.pathRepository.find({
      where: {
        userProfileId: params.userProfileId,
        id: In(params.pathsIds),
      },
    });
    const mappedPaths = pathEntities.map((entity) =>
      this.mapper.toDomain(entity),
    );

    const dbPathsByIds = new Map<string, Path>();
    for (const mappedPath of mappedPaths) {
      dbPathsByIds.set(mappedPath.getId(), mappedPath);
    }

    return params.pathsIds.reduce<Record<string, Path | null>>((acc, id) => {
      acc[id] = dbPathsByIds.get(id) ?? null;
      return acc;
    }, {});
  }

  async delete(id: string): Promise<void> {
    await this.pathRepository.delete(id);
  }

  async update(entity: Path): Promise<void> {
    await this.pathRepository.save(this.mapper.toPersistence(entity));
  }

  async updateMany(entities: Path[]): Promise<void> {
    const pathEntities = entities.map((entity) =>
      this.mapper.toPersistence(entity),
    );
    await this.pathRepository.save(pathEntities);
  }

  async list(
    filters: PathFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<Path>> {
    const where: FindOptionsWhere<PathEntity> = {
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

    if (filters.dateFrom && filters.dateTo) {
      where.date = And(
        MoreThanOrEqual(filters.dateFrom),
        LessThanOrEqual(filters.dateTo),
      );
    } else if (filters.dateFrom) {
      where.date = MoreThanOrEqual(filters.dateFrom);
    } else if (filters.dateTo) {
      where.date = LessThanOrEqual(filters.dateTo);
    }

    const [pathEntities, total] = await this.pathRepository.findAndCount({
      where,
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });

    const items = pathEntities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  async count(filters: PathCountFilters): Promise<number> {
    const where: FindOptionsWhere<PathEntity> = {
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

    return this.pathRepository.count({
      where,
    });
  }
}
