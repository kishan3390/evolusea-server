import { CompassTopics } from '@domain/compass/domain';

export class CompassTopicsLookupDto {
  topics: string[];

  static fromEnum(): CompassTopicsLookupDto {
    return {
      topics: Object.values(CompassTopics),
    };
  }
}
