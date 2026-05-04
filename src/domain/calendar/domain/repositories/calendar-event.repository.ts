import { Transaction } from '@building-blocks/infrastructure';
import { PaginatedList, Pagination, Sort } from '@building-blocks/application';
import {
  CalendarEvent,
  CalendarEventProps,
} from '@domain/calendar/domain/calendar-event';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';

export interface FindCalendarEventByParams {
  date: string;
  belief: BeliefSystems;
  language: Languages;
}

export interface CalendarEventFilters {
  belief: BeliefSystems;
}

export type CalendarEventSort = Sort<Pick<CalendarEventProps, 'createdAt'>>;

export abstract class CalendarEventRepository {
  abstract upsert(entity: CalendarEvent, tx?: Transaction): Promise<void>;
  abstract upsertMany(entity: CalendarEvent[], tx?: Transaction): Promise<void>;
  abstract list(
    filters: CalendarEventFilters,
    pagination: Pagination,
    sorts: CalendarEventSort[],
  ): Promise<PaginatedList<CalendarEvent>>;
  abstract findOneBy(
    params: FindCalendarEventByParams,
  ): Promise<CalendarEvent | null>;
  abstract findManyByDate(date: string): Promise<CalendarEvent[]>;
  abstract update(entity: CalendarEvent): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
