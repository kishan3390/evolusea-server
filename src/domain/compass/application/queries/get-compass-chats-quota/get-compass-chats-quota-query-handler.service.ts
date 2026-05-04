import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import {
  GetCompassChatsQuotaQuery,
  GetCompassChatsQuotaQueryResult,
} from './get-compass-chats-quota.query';
import { CompassChatRepository } from '@domain/compass/domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';
import { IConfig } from '@config';

@Injectable()
export class GetCompassChatsQuotaQueryHandler
  implements
    QueryHandler<GetCompassChatsQuotaQuery, GetCompassChatsQuotaQueryResult>
{
  constructor(
    private readonly compassChatRepository: CompassChatRepository,
    private readonly config: IConfig,
  ) {}

  async handle(
    query: GetCompassChatsQuotaQuery,
  ): Promise<GetCompassChatsQuotaQueryResult> {
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
    const todayCompassChatsCount = await this.compassChatRepository.count({
      userProfileId: query.userProfileId,
      createdFrom: nowInBangkok.start,
      createdTo: nowInBangkok.end,
    });
    const notesDiff =
      this.config.freeTierQuota.dailyCompassChatsLimit - todayCompassChatsCount;
    const remainingCompassChats = notesDiff > 0 ? notesDiff : 0;

    return {
      create: {
        isAllowed: remainingCompassChats > 0,
        limit: this.config.freeTierQuota.dailyCompassChatsLimit,
        remaining: remainingCompassChats,
      },
    };
  }
}
