import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DistributedLockService } from '../../../../distributed-lock';
import {
  CalendarEventRepository,
  CalendarEvent,
} from '@domain/calendar/domain';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';
import { SendCalendarEventNotificationCommandHandler } from '@domain/calendar/application';
import { BeliefSystems } from '@domain/user-profile/domain';
import { DateHelpers } from '../../../../lib/date/date-helpers';

const LOCK_KEY = 'send-calendar-event-notifications-task-lock';
const LOCK_EXPIRATION_TIME = 30_000; // 30 seconds

// 2:30 AM UTC corresponds to 9:30 AM in Thailand (UTC+7), 30 minutes after the path notification job.
const CRON_AT_02_30_UTC = '30 2 * * *';

@Injectable()
export class SendCalendarEventNotificationsTask {
  private readonly logger = new Logger(SendCalendarEventNotificationsTask.name);

  constructor(
    private readonly distributedLock: DistributedLockService,
    private readonly calendarEventRepository: CalendarEventRepository,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly sendCalendarEventNotificationCommandHandler: SendCalendarEventNotificationCommandHandler,
  ) {}

  @Cron(CRON_AT_02_30_UTC, { timeZone: 'UTC' })
  async execute(): Promise<void> {
    await this.distributedLock.executeWithLock(
      LOCK_KEY,
      LOCK_EXPIRATION_TIME,
      () => this.sendNotifications(),
    );
  }

  private async sendNotifications(): Promise<void> {
    const todayInBangkok = DateHelpers.getBangkokCurrentDateString();
    const events =
      await this.calendarEventRepository.findManyByDate(todayInBangkok);
    if (!events.length) {
      this.logger.log('No calendar events found for today');
      return;
    }

    const eventsByBelief = new Map<BeliefSystems, CalendarEvent>();
    for (const event of events) {
      eventsByBelief.set(event.getBelief(), event);
    }
    const batchSize = 200;
    let page = 1;

    while (true) {
      const userProfiles = await this.userProfileFacade.list(page, batchSize);
      if (!userProfiles.length) {
        break;
      }

      for (const userProfile of userProfiles) {
        if (userProfile.getBelief() === BeliefSystems.Other) {
          continue;
        }

        const calendarEvent = eventsByBelief.get(userProfile.getBelief());
        if (!calendarEvent) {
          continue;
        }

        try {
          await this.sendCalendarEventNotificationCommandHandler.handle({
            userProfileId: userProfile.getId(),
            date: todayInBangkok,
          });
        } catch (error) {
          this.logger.error(
            `Failed to send calendar event notification for user ${userProfile.getId()}: ${error}`,
          );
        }
      }

      if (userProfiles.length < batchSize) {
        break;
      }
      page += 1;
    }
  }
}
