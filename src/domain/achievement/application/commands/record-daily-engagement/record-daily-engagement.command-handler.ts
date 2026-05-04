import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { RecordDailyEngagementCommand } from './record-daily-engagement.command';
import { DailyEngagement, DailyEngagementRepository } from '../../../domain';
import { EntityIdGenerator } from '@building-blocks/domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';

@Injectable()
export class RecordDailyEngagementCommandHandler
  implements CommandHandler<RecordDailyEngagementCommand, void>
{
  constructor(
    private readonly dailyEngagementRepository: DailyEngagementRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {}

  async handle(command: RecordDailyEngagementCommand): Promise<void> {
    const today = DateHelpers.getBangkokCurrentDateString();

    const engagement = DailyEngagement.create({
      userProfileId: command.userProfileId,
      date: today,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.dailyEngagementRepository.upsert(engagement);
  }
}
