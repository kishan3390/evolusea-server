import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginatedList,
  QueryHandler,
  SortDirection,
} from '@building-blocks/application';
import { ListCompassChatMessagesQuery } from './list-compass-chat-messages.query';
import {
  CompassChatMessage,
  CompassChatMessageRepository,
  CompassChatMessageVisibility,
  CompassChatRepository,
} from '@domain/compass/domain';

@Injectable()
export class ListCompassChatMessagesQueryHandler
  implements
    QueryHandler<
      ListCompassChatMessagesQuery,
      PaginatedList<CompassChatMessage>
    >
{
  constructor(
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
  ) {}

  async handle(
    query: ListCompassChatMessagesQuery,
  ): Promise<PaginatedList<CompassChatMessage>> {
    const compassChat = await this.compassChatRepository.findOneBy({
      userProfileId: query.userProfileId,
      compassChatId: query.compassChatId,
    });
    if (!compassChat) {
      throw new NotFoundException('Compass chat not found');
    }

    return this.compassChatMessageRepository.list(
      {
        compassChatId: query.compassChatId,
        visibility: CompassChatMessageVisibility.Public,
      },
      query.pagination,
      [{ direction: SortDirection.ASC, field: 'createdAt' }],
    );
  }
}
