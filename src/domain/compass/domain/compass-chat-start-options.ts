import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';

export interface CompassChatStartOptionsProps extends EntityProps {
  id: string;
  isDailyQuoteAvailable: boolean;
  isPersonalNoteAvailable: boolean;
  isPathItemAvailable: boolean;
  isCalendarEventAvailable: boolean;
}

export interface CompassChatStartOptionsCreateArgs {
  isDailyQuoteAvailable: boolean;
  isPersonalNoteAvailable: boolean;
  isPathItemAvailable: boolean;
  isCalendarEventAvailable: boolean;
  entityIdGenerator: EntityIdGenerator;
}

export class CompassChatStartOptions extends Entity<CompassChatStartOptionsProps> {
  private readonly id: string;
  private readonly isDailyQuoteAvailable: boolean;
  private readonly isPersonalNoteAvailable: boolean;
  private readonly isPathItemAvailable: boolean;
  private readonly isCalendarEventAvailable: boolean;

  constructor(props: CompassChatStartOptionsProps) {
    super();

    this.id = props.id;
    this.isDailyQuoteAvailable = props.isDailyQuoteAvailable;
    this.isPersonalNoteAvailable = props.isPersonalNoteAvailable;
    this.isPathItemAvailable = props.isPathItemAvailable;
    this.isCalendarEventAvailable = props.isCalendarEventAvailable;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    isDailyQuoteAvailable,
    isPersonalNoteAvailable,
    isPathItemAvailable,
    isCalendarEventAvailable,
    entityIdGenerator,
  }: CompassChatStartOptionsCreateArgs): CompassChatStartOptions {
    const now = new Date();

    return new CompassChatStartOptions({
      id: entityIdGenerator.generate(),
      isDailyQuoteAvailable,
      isPersonalNoteAvailable,
      isPathItemAvailable,
      isCalendarEventAvailable,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getIsDailyQuoteAvailable(): boolean {
    return this.isDailyQuoteAvailable;
  }

  getIsPersonalNoteAvailable(): boolean {
    return this.isPersonalNoteAvailable;
  }

  getIsPathItemAvailable(): boolean {
    return this.isPathItemAvailable;
  }

  getIsCalendarEventAvailable(): boolean {
    return this.isCalendarEventAvailable;
  }

  getProps(): CompassChatStartOptionsProps {
    return {
      id: this.id,
      isDailyQuoteAvailable: this.isDailyQuoteAvailable,
      isPersonalNoteAvailable: this.isPersonalNoteAvailable,
      isPathItemAvailable: this.isPathItemAvailable,
      isCalendarEventAvailable: this.isCalendarEventAvailable,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
