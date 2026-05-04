import { BeliefSystems, CountryCodes, Languages } from '@domain/user-profile/domain';

export interface CreateUserProfileCommand {
  accountId: string;
  username: string;
  countryCode: CountryCodes;
  belief: BeliefSystems;
  biography?: string;
  language: Languages;
}
