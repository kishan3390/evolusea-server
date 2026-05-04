import { GetCompassChatsQuotaQueryResult } from '@domain/compass/application';

export class CompassChatsQuotaDto {
  create: CompassChatsQuotaCreateDto;

  static fromEntity(
    query: GetCompassChatsQuotaQueryResult,
  ): CompassChatsQuotaDto {
    return {
      create: {
        isAllowed: query.create.isAllowed,
        limit: query.create.limit,
        remaining: query.create.remaining,
      },
    };
  }
}

export class CompassChatsQuotaCreateDto {
  isAllowed: boolean;
  limit: number | null;
  remaining: number | null;
}
