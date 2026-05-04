import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import {
  GetVisionBoardsQuotaQuery,
  GetVisionBoardsQuotaQueryResult,
} from './get-vision-boards-quota.query';
import { VisionBoardRepository } from '../../../domain';
import { IConfig } from '@config';

@Injectable()
export class GetVisionBoardsQuotaQueryHandler
  implements
    QueryHandler<GetVisionBoardsQuotaQuery, GetVisionBoardsQuotaQueryResult>
{
  constructor(
    private readonly visionBoardRepository: VisionBoardRepository,
    private readonly config: IConfig,
  ) {}

  async handle(
    query: GetVisionBoardsQuotaQuery,
  ): Promise<GetVisionBoardsQuotaQueryResult> {
    if (query.accountIsPremium) {
      return {
        create: {
          isAllowed: true,
          limit: null,
          remaining: null,
        },
      };
    }

    const visionBoardsCount = await this.visionBoardRepository.count({
      userProfileId: query.userProfileId,
    });
    const visionBoardsDiff =
      this.config.freeTierQuota.visionBoardsLimit - visionBoardsCount;
    const remainingVisionBoards = visionBoardsDiff > 0 ? visionBoardsDiff : 0;

    return {
      create: {
        isAllowed: remainingVisionBoards > 0,
        limit: this.config.freeTierQuota.visionBoardsLimit,
        remaining: remainingVisionBoards,
      },
    };
  }
}
