import { Mapper } from '@building-blocks/infrastructure';
import { DailyEngagement } from '../../domain';
import { DailyEngagementEntity } from '../entities';

export class DailyEngagementMapper
  implements Mapper<DailyEngagement, DailyEngagementEntity>
{
  toDomain(entity: DailyEngagementEntity): DailyEngagement {
    return new DailyEngagement({
      id: entity.id,
      userProfileId: entity.userProfileId,
      date: entity.date,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: DailyEngagement): DailyEngagementEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      userProfileId: props.userProfileId,
      date: props.date,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
