import { CountryCodes } from '../../../domain/user-profile/domain';

export class CountriesLookupDto {
  countries: string[];

  static fromEnum(): CountriesLookupDto {
    return {
      countries: Object.values(CountryCodes),
    };
  }
}
