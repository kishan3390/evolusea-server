import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { MoodCheckin, MoodCheckinRepository } from '../../../domain';
import { ListMoodCheckinsQuery } from './list-mood-checkins.query';

@Injectable()
export class ListMoodCheckinsQueryHandler
  implements QueryHandler<ListMoodCheckinsQuery, PaginatedList<MoodCheckin>>
{
  constructor(private readonly moodCheckinRepository: MoodCheckinRepository) {}

  async handle(
    query: ListMoodCheckinsQuery,
  ): Promise<PaginatedList<MoodCheckin>> {
    return this.moodCheckinRepository.list(
      {
        userProfileId: query.userProfileId,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
      },
      query.pagination,
    );
  }
}
