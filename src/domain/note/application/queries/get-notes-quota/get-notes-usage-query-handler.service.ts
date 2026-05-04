import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { NoteRepository } from '../../../domain';
import {
  GetNotesQuotaQuery,
  GetNotesQuotaQueryResult,
} from './get-notes-quota.query';
import { DateHelpers } from '../../../../../lib/date/date-helpers';
import { IConfig } from '@config';

@Injectable()
export class GetNotesQuotaQueryHandler
  implements QueryHandler<GetNotesQuotaQuery, GetNotesQuotaQueryResult>
{
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly config: IConfig,
  ) {}

  async handle(query: GetNotesQuotaQuery): Promise<GetNotesQuotaQueryResult> {
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
    const todayNotesCount = await this.noteRepository.count({
      userProfileId: query.userProfileId,
      createdFrom: nowInBangkok.start,
      createdTo: nowInBangkok.end,
    });

    const notesDiff =
      this.config.freeTierQuota.dailyNotesLimit - todayNotesCount;
    const remainingDailyNotes = notesDiff > 0 ? notesDiff : 0;

    return {
      create: {
        isAllowed: remainingDailyNotes > 0,
        limit: this.config.freeTierQuota.dailyNotesLimit,
        remaining: remainingDailyNotes,
      },
    };
  }
}
