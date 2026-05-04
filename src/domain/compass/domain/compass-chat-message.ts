import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';
import { AiRoleEnum } from '../../../ai';
import { CompassChatMessageVisibility } from '@domain/compass/domain/enums/compass-chat-message-visibility.enum';
import { CompassChatSpeaker } from '@domain/compass/domain/enums';

export interface CompassChatMessageProps extends EntityProps {
  id: string;
  compassChatId: string;
  role: AiRoleEnum;
  speaker: CompassChatSpeaker;
  content: string;
  visibility: CompassChatMessageVisibility;
  turnIndex: number;
  metadata: Record<string, any> | null;
}

export interface CompassChatMessageCreateArgs {
  compassChatId: string;
  role: AiRoleEnum;
  speaker: CompassChatSpeaker;
  content: string;
  visibility: CompassChatMessageVisibility;
  turnIndex: number;
  entityIdGenerator: EntityIdGenerator;
  metadata?: Record<string, any> | null;
}

export class CompassChatMessage extends Entity<CompassChatMessageProps> {
  private readonly id: string;
  private readonly compassChatId: string;
  private readonly role: AiRoleEnum;
  private readonly speaker: CompassChatSpeaker;
  private readonly content: string;
  private readonly visibility: CompassChatMessageVisibility;
  private readonly turnIndex: number;
  private readonly metadata: Record<string, any> | null;

  constructor(props: CompassChatMessageProps) {
    super();

    this.id = props.id;
    this.compassChatId = props.compassChatId;
    this.role = props.role;
    this.speaker = props.speaker;
    this.content = props.content;
    this.visibility = props.visibility;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.turnIndex = props.turnIndex;
    this.metadata = props.metadata;
  }

  static create({
    compassChatId,
    role,
    speaker,
    content,
    visibility,
    turnIndex,
    entityIdGenerator,
    metadata,
  }: CompassChatMessageCreateArgs): CompassChatMessage {
    const now = new Date();

    return new CompassChatMessage({
      id: entityIdGenerator.generate(),
      compassChatId,
      role,
      speaker,
      content,
      visibility,
      createdAt: now,
      updatedAt: now,
      turnIndex,
      metadata: metadata ?? null,
    });
  }

  /**
   * Creates a CompassChatMessage from raw props (without EntityIdGenerator).
   * Used for synthetic/ephemeral messages like windowing summaries.
   */
  static createFromProps(props: CompassChatMessageProps): CompassChatMessage {
    return new CompassChatMessage(props);
  }

  getId(): string {
    return this.id;
  }

  getCompassChatId(): string {
    return this.compassChatId;
  }

  getRole(): AiRoleEnum {
    return this.role;
  }

  getSpeaker(): CompassChatSpeaker {
    return this.speaker;
  }

  getContent(): string {
    return this.content;
  }

  getVisibility(): CompassChatMessageVisibility {
    return this.visibility;
  }

  getTurnIndex(): number {
    return this.turnIndex;
  }

  getMetadata(): Record<string, any> | null {
    return this.metadata;
  }

  getProps(): CompassChatMessageProps {
    return {
      id: this.id,
      compassChatId: this.compassChatId,
      role: this.role,
      speaker: this.speaker,
      content: this.content,
      visibility: this.visibility,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      turnIndex: this.turnIndex,
      metadata: this.metadata,
    };
  }
}
