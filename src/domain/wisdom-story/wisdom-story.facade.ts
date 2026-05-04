import { Injectable } from '@nestjs/common';
import {
  GetWisdomStoriesByIdsQueryHandler,
  GetWisdomStoryQuery,
  GetWisdomStoryQueryHandler,
  ListUserWisdomStoriesQuery,
  ListUserWisdomStoriesQueryHandler,
} from './application/queries';
import { GetWisdomStoriesByIdsQuery } from '@domain/wisdom-story/application/queries/get-wisdom-stories-by-ids/get-wisdom-stories-by-ids.query';
import { WisdomStory } from '@domain/wisdom-story/domain';
import { PaginatedList } from '@building-blocks/application';

@Injectable()
export class WisdomStoryFacade {
  constructor(
    private readonly getWisdomStoryQueryHandler: GetWisdomStoryQueryHandler,
    private readonly getWisdomStoriesByIdsQueryHandler: GetWisdomStoriesByIdsQueryHandler,
    private readonly listUserWisdomStoriesQueryHandler: ListUserWisdomStoriesQueryHandler,
  ) {}

  async getWisdomStory(query: GetWisdomStoryQuery) {
    return this.getWisdomStoryQueryHandler.handle(query);
  }

  async getWisdomStoriesById(
    query: GetWisdomStoriesByIdsQuery,
  ): Promise<Record<string, WisdomStory | null>> {
    return this.getWisdomStoriesByIdsQueryHandler.handle(query);
  }

  async listUserWisdomStories(
    query: ListUserWisdomStoriesQuery,
  ): Promise<PaginatedList<WisdomStory>> {
    return this.listUserWisdomStoriesQueryHandler.handle(query);
  }
}
