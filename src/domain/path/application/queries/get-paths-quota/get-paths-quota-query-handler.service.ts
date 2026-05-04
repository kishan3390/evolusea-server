import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import {
  GetPathsQuotaQuery,
  GetPathsQuotaQueryResult,
} from './get-paths-quota.query';
import { PathRepository } from '@domain/path/domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';
import { IConfig } from '@config';

@Injectable()
export class GetPathsQuotaQueryHandler
  implements QueryHandler<GetPathsQuotaQuery, GetPathsQuotaQueryResult>
{
  constructor(
    private readonly pathRepository: PathRepository,
    private readonly config: IConfig,
  ) {}

  async handle(query: GetPathsQuotaQuery): Promise<GetPathsQuotaQueryResult> {
    if (query.accountIsPremium) {
      return {
        create: {
          isAllowed: true,
          limit: null,
          remaining: null,
        },
      };
    }

    const nowInBangkok = DateHelpers.getBangkokDayBoundsInUtc(query.now);
    const todayPathsCount = await this.pathRepository.count({
      userProfileId: query.userProfileId,
      createdFrom: nowInBangkok.start,
      createdTo: nowInBangkok.end,
    });

    const notesDiff =
      this.config.freeTierQuota.dailyPathsLimit - todayPathsCount;
    const remainingDailyPaths = notesDiff > 0 ? notesDiff : 0;

    return {
      create: {
        isAllowed: remainingDailyPaths > 0,
        limit: this.config.freeTierQuota.dailyPathsLimit,
        remaining: remainingDailyPaths,
      },
    };
  }
}
