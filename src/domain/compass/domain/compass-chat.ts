import {
  DomainRuleViolationError,
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';
import { CompassChatMessageVisibility } from '@domain/compass/domain/enums/compass-chat-message-visibility.enum';
import { CompassChatStatus } from '@domain/compass/domain/enums/compass-chat-status.enum';
import { CompassChatSpeaker } from '@domain/compass/domain/enums/compass-chat-active-speaker.enum';
import {
  CompassChatCloseReasons,
  CompassIntentions,
  CompassTopics,
} from '@domain/compass/domain/enums';

export interface CompassChatProps extends EntityProps {
  id: string;
  userProfileId: string;
  intention: CompassIntentions;
  topic: CompassTopics;
  status: CompassChatStatus;
  activeSpeaker: CompassChatSpeaker | null;
  messages?: CompassChatMessage[];
  turnsCount: number;
  closeReason?: CompassChatCloseReasons;
}

export interface CompassChatCreateArgs {
  userProfileId: string;
  intention: CompassIntentions;
  topic: CompassTopics;
  status: CompassChatStatus;
  activeSpeaker: CompassChatSpeaker | null;
  messages?: CompassChatMessage[];
  closeReason?: CompassChatCloseReasons;
  entityIdGenerator: EntityIdGenerator;
}

export class CompassChat extends Entity<CompassChatProps> {
  private readonly id: string;
  private readonly userProfileId: string;
  private readonly intention: CompassIntentions;
  private readonly topic: CompassTopics;
  private status: CompassChatStatus;
  private activeSpeaker: CompassChatSpeaker | null;
  private turnsCount: number;
  private readonly messages: CompassChatMessage[];
  private closeReason?: CompassChatCloseReasons;

  constructor(props: CompassChatProps) {
    super();

    this.id = props.id;
    this.userProfileId = props.userProfileId;
    this.intention = props.intention;
    this.topic = props.topic;
    this.status = props.status;
    this.activeSpeaker = props.activeSpeaker;
    this.turnsCount = props.turnsCount;
    this.messages = props.messages ?? [];
    this.closeReason = props.closeReason;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    userProfileId,
    intention,
    topic,
    status,
    activeSpeaker,
    messages,
    closeReason,
    entityIdGenerator,
  }: CompassChatCreateArgs): CompassChat {
    const now = new Date();

    return new CompassChat({
      id: entityIdGenerator.generate(),
      intention,
      topic,
      status,
      activeSpeaker,
      messages,
      userProfileId,
      turnsCount: 1,
      closeReason,
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

  getIntention(): CompassIntentions {
    return this.intention;
  }

  getTopic(): CompassTopics {
    return this.topic;
  }

  getStatus(): CompassChatStatus {
    return this.status;
  }

  getActiveSpeaker(): CompassChatSpeaker | null {
    return this.activeSpeaker;
  }

  getAllMessages(): CompassChatMessage[] {
    return this.messages;
  }

  getTurnsCount(): number {
    return this.turnsCount;
  }

  getCloseReason(): CompassChatCloseReasons | undefined {
    return this.closeReason;
  }

  getPublicMessages(): CompassChatMessage[] {
    return this.messages.filter(
      (message) =>
        message.getVisibility() === CompassChatMessageVisibility.Public,
    );
  }

  getProps(): CompassChatProps {
    return {
      id: this.id,
      userProfileId: this.userProfileId,
      intention: this.intention,
      topic: this.topic,
      status: this.status,
      activeSpeaker: this.activeSpeaker,
      turnsCount: this.turnsCount,
      messages: this.messages,
      closeReason: this.closeReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  addMessage(message: CompassChatMessage): this {
    this.addMessages([message]);
    return this;
  }

  addMessages(message: CompassChatMessage[]): this {
    this.messages.push(...message);
    this.entityUpdated();
    return this;
  }

  close(reason: CompassChatCloseReasons): this {
    this.activeSpeaker = null;
    this.status = CompassChatStatus.Closed;
    this.closeReason = reason;
    return this;
  }

  setActiveSpeaker(activeSpeaker: CompassChatSpeaker): this {
    if (this.status !== CompassChatStatus.Active) {
      throw new DomainRuleViolationError(
        'Cannot change active speaker for non active compass chat',
      );
    }

    if (
      this.activeSpeaker === CompassChatSpeaker.User &&
      activeSpeaker === CompassChatSpeaker.System
    ) {
      this.turnsCount++;
    }

    this.activeSpeaker = activeSpeaker;
    return this;
  }
}
