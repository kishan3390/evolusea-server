import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { ListVisionBoardsQuery } from './list-vision-boards.query';
import { VisionBoard, VisionBoardRepository } from '../../../domain';

@Injectable()
export class ListVisionBoardsQueryHandler
  implements QueryHandler<ListVisionBoardsQuery, PaginatedList<VisionBoard>>
{
  constructor(private readonly visionBoardRepository: VisionBoardRepository) {}

  async handle(
    query: ListVisionBoardsQuery,
  ): Promise<PaginatedList<VisionBoard>> {
    return this.visionBoardRepository.list(
      {
        userProfileId: query.userProfileId,
      },
      query.pagination,
    );
  }
}
