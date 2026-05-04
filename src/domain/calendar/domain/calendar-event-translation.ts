import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';
import { Languages } from '@domain/user-profile/domain';

export interface CalendarEventTranslationProps extends EntityProps {
  id: string;
  calendarEventId: string;
  language: Languages;
  name: string;
  description: string;
}

export interface CalendarEventTranslationCreateArgs {
  calendarEventId: string;
  language: Languages;
  name: string;
  description: string;
  entityIdGenerator: EntityIdGenerator;
}

export type CalendarEventTranslationUpdateProps = Partial<
  Pick<CalendarEventTranslationProps, 'name' | 'description'>
>;

export class CalendarEventTranslation extends Entity<CalendarEventTranslationProps> {
  private readonly id: string;
  private readonly calendarEventId: string;
  private readonly language: Languages;
  private name: string;
  private description: string;

  constructor(props: CalendarEventTranslationProps) {
    super();
    this.id = props.id;
    this.calendarEventId = props.calendarEventId;
    this.language = props.language;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    calendarEventId,
    language,
    name,
    description,
    entityIdGenerator,
  }: CalendarEventTranslationCreateArgs): CalendarEventTranslation {
    const now = new Date();

    return new CalendarEventTranslation({
      id: entityIdGenerator.generate(),
      calendarEventId,
      language,
      name,
      description,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(data: CalendarEventTranslationUpdateProps): boolean {
    let updated = false;

    if (data.name !== undefined && data.name !== this.name) {
      this.name = data.name;
      updated = true;
    }

    if (
      data.description !== undefined &&
      data.description !== this.description
    ) {
      this.description = data.description;
      updated = true;
    }

    if (updated) {
      this.entityUpdated();
    }

    return updated;
  }

  getId(): string {
    return this.id;
  }

  getCalendarEventId(): string {
    return this.calendarEventId;
  }

  getLanguage(): Languages {
    return this.language;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getProps(): CalendarEventTranslationProps {
    return {
      id: this.id,
      calendarEventId: this.calendarEventId,
      language: this.language,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
