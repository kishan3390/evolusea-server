import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { ListCompassChatsQuery } from './list-compass-chats.query';
import { CompassChat, CompassChatRepository } from '@domain/compass/domain';

@Injectable()
export class ListCompassChatsQueryHandler
  implements QueryHandler<ListCompassChatsQuery, PaginatedList<CompassChat>>
{
  constructor(private readonly compassChatRepository: CompassChatRepository) {}

  async handle(query: ListCompassChatsQuery): Promise<PaginatedList<CompassChat>> {
    return this.compassChatRepository.list(
      {
        userProfileId: query.userProfileId,
        status: query.status,
      },
      query.pagination,
    );
  }
}
