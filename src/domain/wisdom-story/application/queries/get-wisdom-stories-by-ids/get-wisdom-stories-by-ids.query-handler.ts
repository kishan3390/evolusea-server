import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { WisdomStory, WisdomStoryRepository } from '../../../domain';
import { GetWisdomStoriesByIdsQuery } from '@domain/wisdom-story/application/queries/get-wisdom-stories-by-ids/get-wisdom-stories-by-ids.query';

@Injectable()
export class GetWisdomStoriesByIdsQueryHandler
  implements
    QueryHandler<GetWisdomStoriesByIdsQuery, Record<string, WisdomStory | null>>
{
  constructor(private readonly wisdomStoryRepository: WisdomStoryRepository) {}

  async handle(
    query: GetWisdomStoriesByIdsQuery,
  ): Promise<Record<string, WisdomStory | null>> {
    return this.wisdomStoryRepository.findManyByProfileAndIds({
      wisdomStoriesIds: query.wisdomStoriesIds,
    });
  }
}
