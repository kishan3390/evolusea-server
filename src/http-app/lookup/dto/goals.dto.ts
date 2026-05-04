import { Goals } from '../../../domain/compass/domain';

export class GoalsLookupDto {
  goals: string[];

  static fromEnum(): GoalsLookupDto {
    return {
      goals: Object.values(Goals),
    };
  }
}
