import { BeliefSystems } from '../../../domain/user-profile/domain';

export class BeliefsLookupDto {
  beliefs: string[];

  static fromEnum(): BeliefsLookupDto {
    return {
      beliefs: Object.values(BeliefSystems),
    };
  }
}
