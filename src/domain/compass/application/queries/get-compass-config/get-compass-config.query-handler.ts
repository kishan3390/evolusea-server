import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassConfigQuery } from './index';
import { CompassConfig, CompassConfigRepository } from '@domain/compass/domain';

@Injectable()
export class GetCompassConfigQueryHandler
  implements QueryHandler<GetCompassConfigQuery, CompassConfig>
{
  constructor(
    private readonly compassConfigRepository: CompassConfigRepository,
  ) {}

  async handle(query: GetCompassConfigQuery): Promise<CompassConfig | null> {
    return this.compassConfigRepository.findOneBy({
      userProfileId: query.userProfileId,
    });
  }
}
