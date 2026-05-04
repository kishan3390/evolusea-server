import { BeliefSystems, CountryCodes, Languages } from '@domain/user-profile/domain';

export interface UpdateUserProfileCommand {
  accountId: string;
  username: string;
  countryCode: CountryCodes;
  belief: BeliefSystems;
  language: Languages;
  biography?: string;
}
