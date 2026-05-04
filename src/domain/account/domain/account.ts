import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';

export interface AccountProps extends EntityProps {
  id: string;
  authProviderId: string;
  email: string;
}

export interface AccountCreateArgs {
  authProviderId: string;
  email: string;
  entityIdGenerator: EntityIdGenerator;
}

export class Account extends Entity<AccountProps> {
  private readonly id: string;
  private readonly authProviderId: string;
  private readonly email: string;

  constructor(props: AccountProps) {
    super();

    this.id = props.id;
    this.authProviderId = props.authProviderId;
    this.email = props.email;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    authProviderId,
    email,
    entityIdGenerator,
  }: AccountCreateArgs) {
    const now = new Date();
    return new Account({
      id: entityIdGenerator.generate(),
      authProviderId,
      email,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getAuthProviderId(): string {
    return this.authProviderId;
  }

  getEmail(): string {
    return this.email;
  }

  getProps(): AccountProps {
    return {
      id: this.id,
      authProviderId: this.authProviderId,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
