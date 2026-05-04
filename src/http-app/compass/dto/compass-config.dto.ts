import { CompassConfig } from '@domain/compass/domain/compass-config';
import { CompassPersonalities, Goals } from '@domain/compass/domain';

export class CompassConfigDto {
  goal: Goals;
  personality: CompassPersonalities;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(compassConfig: CompassConfig): CompassConfigDto {
    return {
      goal: compassConfig.getGoal(),
      personality: compassConfig.getPersonality(),
      createdAt: compassConfig.getCreatedAt(),
      updatedAt: compassConfig.getUpdatedAt(),
    };
  }
}
