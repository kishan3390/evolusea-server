import { Mapper } from '@building-blocks/infrastructure';
import { CalendarEvent } from '@domain/calendar/domain';
import { CalendarEventEntity } from '@domain/calendar/infrastructure/entities/calendar-event.entity';

export class CalendarEventMapper
  implements Mapper<CalendarEvent, CalendarEventEntity>
{
  toDomain(entity: CalendarEventEntity): CalendarEvent {
    return new CalendarEvent({
      id: entity.id,
      date: entity.date,
      belief: entity.belief,
      translations: [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: CalendarEvent): CalendarEventEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      date: domain.getDate(),
      belief: domain.getBelief(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
