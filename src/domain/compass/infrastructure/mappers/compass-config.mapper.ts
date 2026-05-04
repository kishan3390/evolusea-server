import { Mapper } from '@building-blocks/infrastructure';
import { CompassConfig } from '@domain/compass/domain/compass-config';
import { CompassConfigEntity } from '@domain/compass/infrastructure/entities/compass-config.entity';

export class CompassConfigMapper implements Mapper<CompassConfig, CompassConfigEntity> {
  toDomain(entity: CompassConfigEntity): CompassConfig {
    return new CompassConfig({
      id: entity.id,
      userProfileId: entity.userProfileId,
      goal: entity.goal,
      personality: entity.personality,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: CompassConfig): CompassConfigEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      userProfileId: props.userProfileId,
      goal: props.goal,
      personality: props.personality,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
