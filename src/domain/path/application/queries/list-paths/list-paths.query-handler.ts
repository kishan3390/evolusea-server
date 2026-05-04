import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { Path, PathRepository } from '../../../domain';
import { ListPathsQuery } from './list-paths.query';

@Injectable()
export class ListPathsQueryHandler
  implements QueryHandler<ListPathsQuery, PaginatedList<Path>>
{
  constructor(private readonly pathRepository: PathRepository) {}

  async handle(query: ListPathsQuery): Promise<PaginatedList<Path>> {
    return this.pathRepository.list(
      {
        userProfileId: query.userProfileId,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      },
      query.pagination,
    );
  }
}
