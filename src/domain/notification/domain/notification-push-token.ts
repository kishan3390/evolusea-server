import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';

export interface NotificationPushTokenProps extends EntityProps {
  id: string;
  accountId: string;
  token: string;
}

export interface NotificationCreateArgs {
  accountId: string;
  token: string;
  entityIdGenerator: EntityIdGenerator;
}

export class NotificationPushToken extends Entity<NotificationPushTokenProps> {
  private readonly id: string;
  private accountId: string;
  private token: string;

  constructor(props: NotificationPushTokenProps) {
    super();

    this.id = props.id;
    this.accountId = props.accountId;
    this.token = props.token;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    accountId,
    token,
    entityIdGenerator,
  }: NotificationCreateArgs): NotificationPushToken {
    const now = new Date();

    return new NotificationPushToken({
      id: entityIdGenerator.generate(),
      accountId,
      token,
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

  getToken(): string {
    return this.token;
  }

  getProps(): NotificationPushTokenProps {
    return {
      id: this.id,
      accountId: this.accountId,
      token: this.token,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
