import { IsEnum } from 'class-validator';
import { CompassPersonalities, Goals } from '@domain/compass/domain';

export class CreateCompassConfigDto {
  @IsEnum(Goals)
  goal: Goals;

  @IsEnum(CompassPersonalities)
  personality: CompassPersonalities;
}
