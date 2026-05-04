import { CommandHandler } from '@building-blocks/application';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationFacade } from '@domain/notification/notification.facade';
import { SendCalendarEventNotificationCommand } from './send-calendar-event-notification.command';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';
import { GetCalendarEventQueryHandler } from '@domain/calendar/application/queries/get-calendar-event/get-calendar-event.query-handler';
import { CalendarEventNotificationTranslations } from '@domain/calendar/infrastructure/tasks/calendar-event-notification-translations';

const NOTIFICATION_TYPES = {
  CALENDAR_EVENT_REMINDER: 'CALENDAR_EVENT_REMINDER',
};

@Injectable()
export class SendCalendarEventNotificationCommandHandler
  implements CommandHandler<SendCalendarEventNotificationCommand, void>
{
  private readonly logger = new Logger(
    SendCalendarEventNotificationCommandHandler.name,
  );

  constructor(
    private readonly notificationFacade: NotificationFacade,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly getCalendarEventQueryHandler: GetCalendarEventQueryHandler,
  ) {}

  async handle(command: SendCalendarEventNotificationCommand): Promise<void> {
    const userProfile = await this.userProfileFacade.getByUserProfileId(
      command.userProfileId,
    );
    if (!userProfile) {
      return;
    }

    const calendarEvent = await this.getCalendarEventQueryHandler.handle({
      userProfileId: command.userProfileId,
      date: command.date,
    });
    if (!calendarEvent) {
      return;
    }

    const translation =
      calendarEvent.getTranslation(userProfile.getLanguage()) ||
      calendarEvent.getTranslations()[0];
    if (!translation) {
      return;
    }

    const { title, body } =
      CalendarEventNotificationTranslations.getTranslation(
        userProfile.getLanguage(),
        translation.getName(),
      );

    try {
      await this.notificationFacade.sendNotificationToUser({
        accountId: userProfile.getAccountId(),
        title,
        body,
        data: {
          calendarEventId: calendarEvent.getId(),
          type: NOTIFICATION_TYPES.CALENDAR_EVENT_REMINDER,
          date: command.date,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send calendar event notification to user ${command.userProfileId}: ${error}`,
      );
    }
  }
}
