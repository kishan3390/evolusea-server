import { CompassPersonalities } from '../../../domain/compass/domain';

export class CompassPersonalitiesLookupDto {
  personalities: string[];

  static fromEnum(): CompassPersonalitiesLookupDto {
    return {
      personalities: Object.values(CompassPersonalities),
    };
  }
}