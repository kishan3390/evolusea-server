import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';

export interface CompassChatSummaryProps extends EntityProps {
  id: string;
  compassChatId: string;
  content: string;
}

export interface CompassChatSummaryCreateArgs {
  compassChatId: string;
  content: string;
  entityIdGenerator: EntityIdGenerator;
}

export class CompassChatSummary extends Entity<CompassChatSummaryProps> {
  private readonly id: string;
  private readonly compassChatId: string;
  private readonly content: string;

  constructor(props: CompassChatSummaryProps) {
    super();

    this.id = props.id;
    this.compassChatId = props.compassChatId;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    compassChatId,
    content,
    entityIdGenerator,
  }: CompassChatSummaryCreateArgs): CompassChatSummary {
    const now = new Date();

    return new CompassChatSummary({
      id: entityIdGenerator.generate(),
      compassChatId,
      content,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getCompassChatId(): string {
    return this.compassChatId;
  }

  getContent(): string {
    return this.content;
  }

  getProps(): CompassChatSummaryProps {
    return {
      id: this.id,
      compassChatId: this.compassChatId,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
