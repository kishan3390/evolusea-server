import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '@building-blocks/domain';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';
import {
  CalendarEventTranslation,
  CalendarEventTranslationProps,
} from './calendar-event-translation';

export interface CalendarEventProps extends EntityProps {
  id: string;
  date: string;
  belief: BeliefSystems;
  translations: CalendarEventTranslationProps[];
}

export interface CalendarEventTranslationSeed {
  language: Languages;
  name: string;
  description: string;
}

export interface CalendarEventCreateArgs {
  date: string;
  belief: BeliefSystems;
  translations: CalendarEventTranslationSeed[];
  entityIdGenerator: EntityIdGenerator;
}

export class CalendarEvent extends Entity<CalendarEventProps> {
  private readonly id: string;
  private readonly date: string;
  private readonly belief: BeliefSystems;
  private translations: CalendarEventTranslation[] = [];

  constructor(props: CalendarEventProps) {
    super();

    this.id = props.id;
    this.date = props.date;
    this.belief = props.belief;
    this.translations = props.translations.map(
      (translationProps) =>
        new CalendarEventTranslation({
          id: translationProps.id,
          calendarEventId: translationProps.calendarEventId,
          language: translationProps.language,
          name: translationProps.name,
          description: translationProps.description,
          createdAt: translationProps.createdAt,
          updatedAt: translationProps.updatedAt,
        }),
    );
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create({
    entityIdGenerator,
    date,
    belief,
    translations,
  }: CalendarEventCreateArgs): CalendarEvent {
    const now = new Date();
    const id = entityIdGenerator.generate();

    const calendarEventTranslations = translations.map((translation) =>
      CalendarEventTranslation.create({
        calendarEventId: id,
        language: translation.language,
        name: translation.name,
        description: translation.description,
        entityIdGenerator,
      }),
    );

    return new CalendarEvent({
      id,
      date,
      belief,
      translations: calendarEventTranslations.map((translation) =>
        translation.getProps(),
      ),
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string {
    return this.id;
  }

  getDate(): string {
    return this.date;
  }

  getBelief(): BeliefSystems {
    return this.belief;
  }

  getTranslations(): CalendarEventTranslation[] {
    return this.translations;
  }

  getTranslation(language: Languages): CalendarEventTranslation | null {
    const translation = this.translations.find(
      (eventTranslation) => eventTranslation.getLanguage() === language,
    );
    return translation ?? null;
  }

  addTranslation(translation: CalendarEventTranslation): void {
    this.translations.push(translation);
  }

  setTranslations(translations: CalendarEventTranslation[]): void {
    this.translations = translations;
  }

  getProps(): CalendarEventProps {
    return {
      id: this.id,
      date: this.date,
      translations: this.translations.map((translation) =>
        translation.getProps(),
      ),
      belief: this.belief,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
