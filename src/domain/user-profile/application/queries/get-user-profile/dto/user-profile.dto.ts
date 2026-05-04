import {
  BeliefSystems,
  CountryCodes,
  Languages,
  UserProfile,
} from '@domain/user-profile/domain';

export class UserProfileDto {
  id: string;
  accountId: string;
  username: string;
  countryCode: CountryCodes;
  belief: BeliefSystems;
  language: Languages;
  biography?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;

  static create(
    user: UserProfile,
    hasPremiumEntitlement: boolean,
  ): UserProfileDto {
    const props = user.getProps();

    return {
      id: props.id,
      accountId: props.accountId,
      username: props.username,
      countryCode: props.countryCode,
      belief: props.belief,
      language: props.language,
      biography: props.biography,
      isPremium: hasPremiumEntitlement,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
