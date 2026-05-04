import { ConflictException } from '@nestjs/common';
import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';
import { PathStatus } from './enums';

const STATUSES_ALLOWING_TO_COMPLETE = [PathStatus.Awaiting, PathStatus.Overdue];

const STATUSES_ALLOWING_TO_RESTORE = [PathStatus.Completed];

export interface PathProps extends EntityProps {
  id: string;
  title: string;
  description: string | null;
  date: string;
  userProfileId: string;
  status: PathStatus;
}

export interface PathCreateArgs {
  title: string;
  description: string | null;
  date: string;
  userProfileId: string;
  entityIdGenerator: EntityIdGenerator;
}

export class Path extends Entity<PathProps> {
  private readonly id: string;
  private title: string;
  private description: string | null;
  private date: string;
  private userProfileId: string;
  private status: PathStatus;

  constructor(props: PathProps) {
    super();

    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.date = props.date;
    this.userProfileId = props.userProfileId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    title,
    description,
    date,
    userProfileId,
    entityIdGenerator,
  }: PathCreateArgs): Path {
    const now = new Date();

    return new Path({
      id: entityIdGenerator.generate(),
      title,
      description,
      date,
      userProfileId,
      status: PathStatus.Awaiting,
      createdAt: now,
      updatedAt: now,
    });
  }

  setTitle(title: string): this {
    this.title = title;
    this.entityUpdated();
    return this;
  }

  setDescription(description: string | null): this {
    this.description = description;
    this.entityUpdated();
    return this;
  }

  setDate(date: string): this {
    this.date = date;
    this.entityUpdated();
    return this;
  }

  markAsCompleted(): this {
    if (!STATUSES_ALLOWING_TO_COMPLETE.includes(this.status)) {
      throw new ConflictException(
        `Path is in ${this.status}, cannot be marked as completed`,
      );
    }
    this.status = PathStatus.Completed;
    this.entityUpdated();
    return this;
  }

  markAsOverdue(): this {
    if (this.status === PathStatus.Overdue) {
      return this; // not throwing exception on purpose to not interfere with cron task, this feature is not exposed to users
    }
    this.status = PathStatus.Overdue;
    this.entityUpdated();
    return this;
  }

  restore(): this {
    if (!STATUSES_ALLOWING_TO_RESTORE.includes(this.status)) {
      throw new ConflictException(
        `Path is in ${this.status}, cannot be restored`,
      );
    }
    this.status = PathStatus.Awaiting;
    this.entityUpdated();
    return this;
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getDate(): string {
    return this.date;
  }

  getUserProfileId(): string {
    return this.userProfileId;
  }

  getStatus(): PathStatus {
    return this.status;
  }

  getProps(): PathProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      date: this.date,
      userProfileId: this.userProfileId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
