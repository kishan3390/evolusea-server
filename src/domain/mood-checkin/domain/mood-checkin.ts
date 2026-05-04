import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';
import { Moods } from '../../note/domain/enums';

export interface MoodCheckinProps extends EntityProps {
  id: string;
  mood: Moods;
  userProfileId: string;
}

export interface MoodCheckinCreateArgs {
  mood: Moods;
  userProfileId: string;
  entityIdGenerator: EntityIdGenerator;
}

export class MoodCheckin extends Entity<MoodCheckinProps> {
  private readonly id: string;
  private readonly mood: Moods;
  private readonly userProfileId: string;

  constructor(props: MoodCheckinProps) {
    super();

    this.id = props.id;
    this.mood = props.mood;
    this.userProfileId = props.userProfileId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    mood,
    userProfileId,
    entityIdGenerator,
  }: MoodCheckinCreateArgs): MoodCheckin {
    const now = new Date();

    return new MoodCheckin({
      id: entityIdGenerator.generate(),
      mood,
      userProfileId,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getMood(): Moods {
    return this.mood;
  }

  getUserProfileId(): string {
    return this.userProfileId;
  }

  getProps(): MoodCheckinProps {
    return {
      id: this.id,
      mood: this.mood,
      userProfileId: this.userProfileId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
