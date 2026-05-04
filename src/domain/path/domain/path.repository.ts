import { PaginatedList, Pagination } from '@building-blocks/application';
import { PathStatus } from './enums';
import { Path } from './path';

export interface FindPathByParams {
  id: string;
  userProfileId: string;
}

export interface FindManyPathsByProfileAndIdsParams {
  pathsIds: string[];
  userProfileId: string;
}

export interface FindManyPathsByParams {
  status?: PathStatus;
  isScheduledBefore?: Date;
  isScheduledAt?: string;
}

export interface PathFilters {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
  dateFrom?: string;
  dateTo?: string;
}

export interface PathCountFilters {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export abstract class PathRepository {
  abstract create(entity: Path): Promise<void>;
  abstract findOneBy(params: FindPathByParams): Promise<Path | null>;
  abstract delete(id: string): Promise<void>;
  abstract update(entity: Path): Promise<void>;
  abstract updateMany(entities: Path[]): Promise<void>;
  abstract findManyBy(params: FindManyPathsByParams): Promise<Path[]>;
  abstract findManyByProfileAndIds(
    params: FindManyPathsByProfileAndIdsParams,
  ): Promise<Record<string, Path | null>>;
  abstract list(
    filters: PathFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<Path>>;
  abstract count(filters: PathCountFilters): Promise<number>;
}
