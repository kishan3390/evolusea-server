import { Mapper } from '@building-blocks/infrastructure';
import { CalendarEventTranslation } from '@domain/calendar/domain';
import { CalendarEventTranslationEntity } from '@domain/calendar/infrastructure/entities/calendar-event-translation.entity';

export class CalendarEventTranslationMapper
  implements Mapper<CalendarEventTranslation, CalendarEventTranslationEntity>
{
  toDomain(entity: CalendarEventTranslationEntity): CalendarEventTranslation {
    return new CalendarEventTranslation({
      id: entity.id,
      calendarEventId: entity.calendarEventId,
      language: entity.language,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(
    domain: CalendarEventTranslation,
  ): CalendarEventTranslationEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      calendarEventId: props.calendarEventId,
      language: props.language,
      name: props.name,
      description: props.description,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
