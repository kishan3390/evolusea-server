import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { Path, PathRepository } from '../../../domain';
import { GetPathQuery } from './get-path.query';

@Injectable()
export class GetPathQueryHandler implements QueryHandler<GetPathQuery, Path> {
  constructor(private readonly pathRepository: PathRepository) {}

  async handle(query: GetPathQuery): Promise<Path | null> {
    return this.pathRepository.findOneBy({
      id: query.id,
      userProfileId: query.userProfileId,
    });
  }
}
