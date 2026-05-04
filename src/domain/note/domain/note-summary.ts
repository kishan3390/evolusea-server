import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';

export interface NoteSummaryProps extends EntityProps {
  id: string;
  noteId: string;
  content: string;
}

export interface NoteSummaryCreateArgs {
  noteId: string;
  content: string;
  entityIdGenerator: EntityIdGenerator;
}

export class NoteSummary extends Entity<NoteSummaryProps> {
  private readonly id: string;
  private readonly noteId: string;
  private readonly content: string;

  constructor(props: NoteSummaryProps) {
    super();

    this.id = props.id;
    this.noteId = props.noteId;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    noteId,
    content,
    entityIdGenerator,
  }: NoteSummaryCreateArgs): NoteSummary {
    const now = new Date();

    return new NoteSummary({
      id: entityIdGenerator.generate(),
      noteId,
      content,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getNoteId(): string {
    return this.noteId;
  }

  getContent(): string {
    return this.content;
  }

  getProps(): NoteSummaryProps {
    return {
      id: this.id,
      noteId: this.noteId,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
