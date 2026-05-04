import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { Path, PathRepository } from '../../../domain';
import { GetPathsByIdsQuery } from './get-paths-by-ids.query';

@Injectable()
export class GetPathsByIdsQueryHandler
  implements QueryHandler<GetPathsByIdsQuery, Record<string, Path | null>>
{
  constructor(private readonly pathRepository: PathRepository) {}

  async handle(
    query: GetPathsByIdsQuery,
  ): Promise<Record<string, Path | null>> {
    return this.pathRepository.findManyByProfileAndIds({
      pathsIds: query.pathsIds,
      userProfileId: query.userProfileId,
    });
  }
}
