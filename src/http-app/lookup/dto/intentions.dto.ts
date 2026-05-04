import { CompassIntentions } from '@domain/compass/domain/enums/compass-intentions.enum';

export class IntentionsLookupDto {
  intentions: string[];

  static fromEnum(): IntentionsLookupDto {
    return {
      intentions: Object.values(CompassIntentions),
    };
  }
}
