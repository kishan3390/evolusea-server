import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';

export interface VisionBoardProps extends EntityProps {
  id: string;
  userProfileId: string;
  title: string;
  description?: string | null;
  pathsIds: string[];
  notesIds: string[];
  wisdomStoriesIds: string[];
}

export interface VisionBoardCreateArgs {
  userProfileId: string;
  title: string;
  description?: string | null;
  pathsIds: string[];
  notesIds: string[];
  wisdomStoriesIds: string[];
  entityIdGenerator: EntityIdGenerator;
}

export class VisionBoard extends Entity<VisionBoardProps> {
  private readonly id: string;
  private readonly userProfileId: string;
  private title: string;
  private description: string | null;
  private pathsIds: string[];
  private notesIds: string[];
  private wisdomStoriesIds: string[];

  constructor(props: VisionBoardProps) {
    super();

    this.id = props.id;
    this.userProfileId = props.userProfileId;
    this.title = props.title;
    this.description = props.description ?? null;
    this.pathsIds = [...props.pathsIds];
    this.notesIds = [...props.notesIds];
    this.wisdomStoriesIds = [...props.wisdomStoriesIds];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(args: VisionBoardCreateArgs): VisionBoard {
    const now = new Date();

    return new VisionBoard({
      id: args.entityIdGenerator.generate(),
      userProfileId: args.userProfileId,
      title: args.title,
      description: args.description,
      pathsIds: args.pathsIds,
      notesIds: args.notesIds,
      wisdomStoriesIds: args.wisdomStoriesIds,
      createdAt: now,
      updatedAt: now,
    });
  }

  setTitle(title: string): this {
    this.title = title;
    this.entityUpdated();
    return this;
  }

  setDescription(description?: string | null): this {
    this.description = description ?? null;
    this.entityUpdated();
    return this;
  }

  setPathIds(pathIds: string[]): this {
    this.pathsIds = [...pathIds];
    this.entityUpdated();
    return this;
  }

  setNoteIds(noteIds: string[]): this {
    this.notesIds = [...noteIds];
    this.entityUpdated();
    return this;
  }

  setWisdomStoryIds(wisdomStoryIds: string[]): this {
    this.wisdomStoriesIds = [...wisdomStoryIds];
    this.entityUpdated();
    return this;
  }

  getId(): string {
    return this.id;
  }

  getUserProfileId(): string {
    return this.userProfileId;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getPathsIds(): string[] {
    return [...this.pathsIds];
  }

  getNoteIds(): string[] {
    return [...this.notesIds];
  }

  getWisdomStoriesIds(): string[] {
    return [...this.wisdomStoriesIds];
  }

  getProps(): VisionBoardProps {
    return {
      id: this.id,
      userProfileId: this.userProfileId,
      title: this.title,
      description: this.description,
      pathsIds: [...this.pathsIds],
      notesIds: [...this.notesIds],
      wisdomStoriesIds: [...this.wisdomStoriesIds],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
