import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';
import { Moods } from './enums';

export interface NoteProps extends EntityProps {
  id: string;
  title: string;
  description: string | null;
  mood: Moods | null;
  userProfileId: string;
  anonymousSharingEnabled: boolean;
}

export interface NoteCreateArgs {
  title: string;
  description: string | null;
  mood?: Moods | null;
  userProfileId: string;
  anonymousSharingEnabled: boolean;
  entityIdGenerator: EntityIdGenerator;
}

export class Note extends Entity<NoteProps> {
  private readonly id: string;
  private title: string;
  private description: string | null;
  private mood: Moods | null;
  private userProfileId: string;
  private anonymousSharingEnabled: boolean;

  constructor(props: NoteProps) {
    super();

    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.mood = props.mood;
    this.userProfileId = props.userProfileId;
    this.anonymousSharingEnabled = props.anonymousSharingEnabled;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    title,
    description,
    mood,
    userProfileId,
    anonymousSharingEnabled,
    entityIdGenerator,
  }: NoteCreateArgs): Note {
    const now = new Date();

    return new Note({
      id: entityIdGenerator.generate(),
      title,
      description,
      mood: mood ?? null,
      userProfileId,
      anonymousSharingEnabled,
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

  setMood(mood: Moods | null): this {
    this.mood = mood;
    this.entityUpdated();
    return this;
  }

  enableAnonymousSharing(): this {
    this.anonymousSharingEnabled = true;
    this.entityUpdated();
    return this;
  }

  disableAnonymousSharing(): this {
    this.anonymousSharingEnabled = false;
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

  getMood(): Moods | null {
    return this.mood;
  }

  isAnonymousSharingEnabled(): boolean {
    return this.anonymousSharingEnabled;
  }

  getUserProfileId(): string {
    return this.userProfileId;
  }

  getProps(): NoteProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      mood: this.mood,
      userProfileId: this.userProfileId,
      anonymousSharingEnabled: this.anonymousSharingEnabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
