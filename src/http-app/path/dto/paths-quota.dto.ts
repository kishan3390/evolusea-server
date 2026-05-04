import { GetPathsQuotaQueryResult } from '@domain/path/application';

export class PathsQuotaDto {
  create: PathsQuotaCreateDto;

  static fromEntity(query: GetPathsQuotaQueryResult): PathsQuotaDto {
    return {
      create: {
        isAllowed: query.create.isAllowed,
        limit: query.create.limit,
        remaining: query.create.remaining,
      },
    };
  }
}

export class PathsQuotaCreateDto {
  isAllowed: boolean;
  limit: number | null;
  remaining: number | null;
}
