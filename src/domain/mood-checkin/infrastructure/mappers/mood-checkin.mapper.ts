import { Mapper } from '@building-blocks/infrastructure';
import { MoodCheckin } from '../../domain';
import { MoodCheckinEntity } from '../entities';

export class MoodCheckinMapper implements Mapper<MoodCheckin, MoodCheckinEntity> {
  toDomain(entity: MoodCheckinEntity): MoodCheckin {
    return new MoodCheckin({
      id: entity.id,
      mood: entity.mood,
      userProfileId: entity.userProfileId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: MoodCheckin): MoodCheckinEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      mood: props.mood,
      userProfileId: props.userProfileId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
