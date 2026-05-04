import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { WisdomStory, WisdomStoryRepository } from '../../../domain';
import { GetWisdomStoryQuery } from './get-wisdom-story.query';

@Injectable()
export class GetWisdomStoryQueryHandler
  implements QueryHandler<GetWisdomStoryQuery, WisdomStory>
{
  constructor(private readonly wisdomStoryRepository: WisdomStoryRepository) {}

  async handle(query: GetWisdomStoryQuery): Promise<WisdomStory | null> {
    return this.wisdomStoryRepository.findOneById(query.id);
  }
}
