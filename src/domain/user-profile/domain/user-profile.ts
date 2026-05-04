import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';
import { CountryCodes, BeliefSystems, Languages } from './enums';
import { UserProfileCounter } from './user-profile.counter';
import { UserProfileCannotBeAssignedToTwoAccountsRule } from './rules';

export interface UserProfileProps extends EntityProps {
  id: string;
  accountId: string;
  username: string;
  countryCode: CountryCodes;
  belief: BeliefSystems;
  language: Languages;
  biography?: string;
}

export interface UserProfileCreateArgs {
  accountId: string;
  username: string;
  countryCode: CountryCodes;
  belief: BeliefSystems;
  biography?: string;
  language: Languages;
  entityIdGenerator: EntityIdGenerator;
  usersIdentitiesCounter: UserProfileCounter;
}

export class UserProfile extends Entity<UserProfileProps> {
  private readonly id: string;
  private readonly accountId: string;
  private username: string;
  private countryCode: CountryCodes;
  private belief: BeliefSystems;
  private language: Languages;
  private biography?: string;

  constructor(props: UserProfileProps) {
    super();

    this.id = props.id;
    this.accountId = props.accountId;
    this.username = props.username;
    this.countryCode = props.countryCode;
    this.belief = props.belief;
    this.biography = props.biography;
    this.language = props.language;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static async create({
    accountId,
    username,
    countryCode,
    belief,
    biography,
    language,
    entityIdGenerator,
    usersIdentitiesCounter,
  }: UserProfileCreateArgs): Promise<UserProfile> {
    await this.checkAsyncRule(
      new UserProfileCannotBeAssignedToTwoAccountsRule({
        userProfileCounter: usersIdentitiesCounter,
        accountId,
      }),
    );

    const now = new Date();
    return new UserProfile({
      id: entityIdGenerator.generate(),
      accountId,
      username,
      countryCode,
      belief,
      biography,
      language,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getAccountId(): string {
    return this.accountId;
  }

  getLanguage(): Languages {
    return this.language;
  }

  getBelief(): BeliefSystems {
    return this.belief;
  }

  getUsername(): string {
    return this.username;
  }

  getCountryCode(): CountryCodes {
    return this.countryCode;
  }

  getBiography(): string | undefined {
    return this.biography;
  }

  setUsername(username: string): this {
    this.username = username;
    this.entityUpdated();
    return this;
  }

  setCountryCode(countryCode: CountryCodes): this {
    this.countryCode = countryCode;
    this.entityUpdated();
    return this;
  }

  setBelief(belief: BeliefSystems): this {
    this.belief = belief;
    this.entityUpdated();
    return this;
  }

  setBiography(biography?: string): this {
    this.biography = biography;
    this.entityUpdated();
    return this;
  }

  setLanguage(language: Languages): this {
    this.language = language;
    this.entityUpdated();
    return this;
  }

  getProps(): UserProfileProps {
    return {
      id: this.id,
      accountId: this.accountId,
      username: this.username,
      countryCode: this.countryCode,
      belief: this.belief,
      biography: this.biography,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      language: this.language,
    };
  }
}
