import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { MoodCheckin, MoodCheckinRepository } from '../../../domain';
import { GetLatestMoodCheckinQuery } from './get-latest-mood-checkin.query';

@Injectable()
export class GetLatestMoodCheckinQueryHandler
  implements QueryHandler<GetLatestMoodCheckinQuery, MoodCheckin | null>
{
  constructor(private readonly moodCheckinRepository: MoodCheckinRepository) {}

  async handle(query: GetLatestMoodCheckinQuery): Promise<MoodCheckin | null> {
    return this.moodCheckinRepository.findLatestByUserProfileId(
      query.userProfileId,
    );
  }
}
