import { GetVisionBoardsQuotaQueryResult } from '@domain/vision-board/application';

export class VisionBoardQuotaDto {
  create: {
    isAllowed: boolean;
    limit: number | null;
    remaining: number | null;
  };

  static from(params: GetVisionBoardsQuotaQueryResult): VisionBoardQuotaDto {
    return {
      create: {
        isAllowed: params.create.isAllowed,
        limit: params.create.limit,
        remaining: params.create.remaining,
      },
    };
  }
}
