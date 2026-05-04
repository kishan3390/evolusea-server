import { Module } from '@nestjs/common';
import { CalendarFacade } from '@domain/calendar/calendar.facade';
import { AiModule } from '../../ai';
import { PromptModule } from '@domain/prompt/prompt.module';
import { DistributedLockModule } from '../../distributed-lock';
import { SyncCalendarEvents } from '@domain/calendar/infrastructure/tasks/sync-calendar-events';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventEntity } from '@domain/calendar/infrastructure/entities/calendar-event.entity';
import { CalendarEventTranslationEntity } from '@domain/calendar/infrastructure/entities/calendar-event-translation.entity';
import { CalendarEventRepository } from '@domain/calendar/domain';
import { PostgresCalendarEventRepository } from '@domain/calendar/infrastructure/repositories/postgres-calendar-event.repository';
import { GetCalendarEventQueryHandler } from '@domain/calendar/application/queries/get-calendar-event/get-calendar-event.query-handler';
import { UserProfileModule } from '@domain/user-profile/user-profile.module';
import { NotificationModule } from '@domain/notification/notification.module';
import { SendCalendarEventNotificationCommandHandler } from '@domain/calendar/application';
import { SendCalendarEventNotificationsTask } from '@domain/calendar/infrastructure/tasks/send-calendar-event-notifications.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEventEntity, CalendarEventTranslationEntity]),
    AiModule,
    PromptModule,
    DistributedLockModule,
    UserProfileModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: CalendarEventRepository,
      useClass: PostgresCalendarEventRepository,
    },
    CalendarFacade,
    SyncCalendarEvents,
    SendCalendarEventNotificationsTask,
    GetCalendarEventQueryHandler,
    SendCalendarEventNotificationCommandHandler,
  ],
  exports: [CalendarFacade],
})
export class CalendarModule {}
