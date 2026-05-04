import { Injectable } from '@nestjs/common';
import { GetCalendarEventQueryHandler } from '@domain/calendar/application/queries/get-calendar-event/get-calendar-event.query-handler';
import { GetCalendarEventQuery } from '@domain/calendar/application';
import { CalendarEvent } from '@domain/calendar/domain';
import { SendCalendarEventNotificationCommandHandler } from '@domain/calendar/application';
import { SendCalendarEventNotificationCommand } from '@domain/calendar/application';

@Injectable()
export class CalendarFacade {
  constructor(
    private readonly getCalendarEventQueryHandler: GetCalendarEventQueryHandler,
    private readonly sendCalendarEventNotificationCommandHandler: SendCalendarEventNotificationCommandHandler,
  ) {}

  async getByDateAndUserProfileId(
    query: GetCalendarEventQuery,
  ): Promise<CalendarEvent | null> {
    return this.getCalendarEventQueryHandler.handle(query);
  }

  async sendCalendarEventNotification(
    command: SendCalendarEventNotificationCommand,
  ): Promise<void> {
    await this.sendCalendarEventNotificationCommandHandler.handle(command);
  }
}
