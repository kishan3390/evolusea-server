import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Pagination,
  QueryHandler,
  SortDirection,
} from '@building-blocks/application';
import { GetCompassChatQuery } from './get-compass-chat.query';
import {
  CompassChat,
  CompassChatMessage,
  CompassChatMessageRepository,
  CompassChatMessageVisibility,
  CompassChatRepository,
} from '@domain/compass/domain';

@Injectable()
export class GetCompassChatQueryHandler
  implements
    QueryHandler<
      GetCompassChatQuery,
      { compassChat: CompassChat; compassChatMessages: CompassChatMessage[] }
    >
{
  constructor(
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
  ) {}

  async handle(query: GetCompassChatQuery): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    const compassChat = await this.compassChatRepository.findOneBy({
      userProfileId: query.userProfileId,
      compassChatId: query.compassChatId,
    });
    if (!compassChat) {
      throw new NotFoundException('Compass chat not found');
    }

    let compassChatMessages: CompassChatMessage[] = [];
    if (query.includeMessages) {
      const compassChatMessagesPagination =
        await this.compassChatMessageRepository.list(
          {
            compassChatId: query.compassChatId,
            visibility: CompassChatMessageVisibility.Public,
          },
          Pagination.unlimited(),
          [{ direction: SortDirection.ASC, field: 'createdAt' }],
        );
      compassChatMessages = compassChatMessagesPagination.items;
    }

    return {
      compassChat,
      compassChatMessages,
    };
  }
}
