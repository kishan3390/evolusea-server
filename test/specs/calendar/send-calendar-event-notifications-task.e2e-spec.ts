import { TestApp } from '../../test-app';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CalendarEventEntity } from '../../../src/domain/calendar/infrastructure/entities/calendar-event.entity';
import { CalendarEventTranslationEntity } from '../../../src/domain/calendar/infrastructure/entities/calendar-event-translation.entity';
import { SendCalendarEventNotificationsTask } from '../../../src/domain/calendar/infrastructure/tasks/send-calendar-event-notifications.task';
import { NotificationProvider } from '../../../src/domain/notification/domain';
import { FakeNotificationProvider } from '../../../src/domain/notification/infrastructure';
import { TokenMessage } from '../../../src/domain/notification/domain/notifications.provider';
import { DateHelpers } from '../../../src/lib/date/date-helpers';
import { v4 as uuid } from 'uuid';
import { BeliefSystems } from '@domain/user-profile/domain';

const buildCalendarEvent = ({
  date,
  belief,
  createdAt,
  updatedAt,
}: {
  date: string;
  belief: string;
  createdAt: Date;
  updatedAt: Date;
}): CalendarEventEntity =>
  Object.assign(new CalendarEventEntity(), {
    id: uuid(),
    date,
    belief: belief as BeliefSystems,
    createdAt,
    updatedAt,
  } satisfies CalendarEventEntity);

describe('Send calendar event notifications task (e2e)', () => {
  let app: TestApp;
  let user: SignedInAccount;
  let task: SendCalendarEventNotificationsTask;
  let calendarEventRepository: Repository<CalendarEventEntity>;
  let calendarEventTranslationRepository: Repository<CalendarEventTranslationEntity>;
  let notificationProvider: FakeNotificationProvider;
  let todayInBangkok: string;

  beforeEach(async (context) => {
    app = context.app;
    user = await app.signedInVerifiedAccount();
    task = app.getProvider(SendCalendarEventNotificationsTask);
    calendarEventRepository = app.getProvider(
      getRepositoryToken(CalendarEventEntity),
    );
    calendarEventTranslationRepository = app.getProvider(
      getRepositoryToken(CalendarEventTranslationEntity),
    );
    notificationProvider = app.getProvider(
      NotificationProvider,
    ) as FakeNotificationProvider;
    todayInBangkok = DateHelpers.getBangkokCurrentDateString();
  });

  it('given calendar event for today, task should send notification with localized data', async () => {
    const userProfile = await user.userProfileApi.getMyProfile();
    await user.notificationAPI.registerPushToken({ token: 'calendar-token' });

    const createdAt = new Date();
    const calendarEvent = buildCalendarEvent({
      date: todayInBangkok,
      belief: userProfile.body.belief,
      createdAt,
      updatedAt: createdAt,
    });
    await calendarEventRepository.save(calendarEvent);
    await calendarEventTranslationRepository.save(
      Object.assign(new CalendarEventTranslationEntity(), {
        id: uuid(),
        calendarEventId: calendarEvent.id,
        language: userProfile.body.language,
        name: 'Equinox Celebration',
        description: 'Gather with your community today.',
        createdAt,
        updatedAt: createdAt,
      } satisfies CalendarEventTranslationEntity),
    );

    await task.execute();

    const emitted = notificationProvider.emitted;
    expect(emitted).toHaveLength(1);
    const notification = emitted[0] as TokenMessage;
    expect(notification.title).toContain('Equinox Celebration');
    expect(notification.body).toEqual(expect.any(String));
    expect(notification.data).toEqual({
      calendarEventId: calendarEvent.id,
      type: 'CALENDAR_EVENT_REMINDER',
      date: todayInBangkok,
    });
  });

  it('given no calendar event for today, task should not send notification', async () => {
    await user.notificationAPI.registerPushToken({ token: 'calendar-token-2' });

    await task.execute();

    expect(notificationProvider.emitted).toHaveLength(0);
  });
});
