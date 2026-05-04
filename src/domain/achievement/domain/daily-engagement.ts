import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';

export interface DailyEngagementProps extends EntityProps {
  id: string;
  userProfileId: string;
  date: string; // YYYY-MM-DD
}

export interface DailyEngagementCreateArgs {
  userProfileId: string;
  date: string; // YYYY-MM-DD
  entityIdGenerator: EntityIdGenerator;
}

export class DailyEngagement extends Entity<DailyEngagementProps> {
  private readonly id: string;
  private readonly userProfileId: string;
  private readonly date: string;

  constructor(props: DailyEngagementProps) {
    super();

    this.id = props.id;
    this.userProfileId = props.userProfileId;
    this.date = props.date;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    userProfileId,
    date,
    entityIdGenerator,
  }: DailyEngagementCreateArgs): DailyEngagement {
    const now = new Date();

    return new DailyEngagement({
      id: entityIdGenerator.generate(),
      userProfileId,
      date,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getUserProfileId(): string {
    return this.userProfileId;
  }

  getDate(): string {
    return this.date;
  }

  getProps(): DailyEngagementProps {
    return {
      id: this.id,
      userProfileId: this.userProfileId,
      date: this.date,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
