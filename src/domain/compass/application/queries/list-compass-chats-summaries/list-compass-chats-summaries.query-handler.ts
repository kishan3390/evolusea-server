import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { CompassChatSummaryRepository } from '@domain/compass/domain/repositories/compass-chat-summary.repository';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';
import { ListCompassChatsSummariesQuery } from '@domain/compass/application/queries/list-compass-chats-summaries/list-compass-chats-summaries.query';

@Injectable()
export class ListCompassChatsSummariesQueryHandler
  implements
    QueryHandler<
      ListCompassChatsSummariesQuery,
      PaginatedList<CompassChatSummary>
    >
{
  constructor(
    private readonly compassChatSummaryRepository: CompassChatSummaryRepository,
  ) {}

  async handle(
    query: ListCompassChatsSummariesQuery,
  ): Promise<PaginatedList<CompassChatSummary>> {
    return this.compassChatSummaryRepository.list(
      {
        userProfileId: query.userProfileId,
      },
      query.pagination,
    );
  }
}
