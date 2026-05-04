import { TestApp } from '../../test-app';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { TriggerPathNotificationsTask } from '../../../src/domain/path/infrastructure/tasks/trigger-path-notifications.task';
import { MarkPastPathsAsOverdueTask } from '../../../src/domain/path/infrastructure/tasks/mark-past-paths-as-overdue.task';
import { Languages } from '../../../src/domain/user-profile/domain';
import { NotificationProvider } from '../../../src/domain/notification/domain';
import { FakeNotificationProvider } from '../../../src/domain/notification/infrastructure';
import { TokenMessage } from '../../../src/domain/notification/domain/notifications.provider';
import { PathNotificationTranslations } from '../../../src/domain/path/infrastructure/tasks/path-notification-translations';
import { Repository } from 'typeorm';
import { PathEntity } from '../../../src/domain/path/infrastructure/entities';
import { getRepositoryToken } from '@nestjs/typeorm';

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('Trigger path notifications task (e2e)', () => {
  let app: TestApp;
  let user: SignedInAccount;
  let task: TriggerPathNotificationsTask;
  let notificationProvider: FakeNotificationProvider;
  let pathRepository: Repository<PathEntity>;
  let yesterday: string;

  beforeEach(async (context) => {
    app = context.app;
    task = app.getProvider(TriggerPathNotificationsTask);
    notificationProvider = app.getProvider(
      NotificationProvider,
    ) as FakeNotificationProvider;
    pathRepository = app.getProvider(getRepositoryToken(PathEntity));

    user = await app.signedInVerifiedAccount();

    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterday = fmt(yesterdayDate);
  });

  it('given overdue path from yesterday, task should send notification with correct English translation', async () => {
    const createPathRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: yesterday,
    });
    expect(createPathRes.status).toBe(201);
    await user.notificationAPI.registerPushToken({ token: 'fake-token-123' });

    const markOverdueTask = app.getProvider(MarkPastPathsAsOverdueTask);
    await markOverdueTask.execute();

    await task.execute();

    const emittedNotifications = notificationProvider.emitted;
    expect(emittedNotifications).toHaveLength(1);

    const notification = emittedNotifications[0] as TokenMessage;
    expect(notification.title).toBe(
      PathNotificationTranslations.getTranslation(Languages.English).title,
    );
    expect(notification.body).toBe(
      PathNotificationTranslations.getTranslation(Languages.English).body,
    );
    expect(notification.data).toEqual({
      pathId: createPathRes.body.id,
      type: 'PATH_OVERDUE_REMINDER',
    });
  });

  it('given overdue path from yesterday and completed path from yesterday, task should send notification only for overdue path', async () => {
    const createPathRes = await user.pathAPI.createPath({
      title: 'Overdue path',
      description: 'Will be overdue',
      date: yesterday,
    });
    expect(createPathRes.status).toBe(201);

    await user.notificationAPI.registerPushToken({ token: 'fake-token-321' });

    const completedPathRes = await user.pathAPI.createPath({
      title: 'Completed path',
      description: 'Will be completed',
      date: yesterday,
    });
    await user.pathAPI.completePath(completedPathRes.body.id);

    const markOverdueTask = app.getProvider(MarkPastPathsAsOverdueTask);

    await markOverdueTask.execute();

    await task.execute();

    const emittedNotifications = notificationProvider.emitted;
    expect(emittedNotifications).toHaveLength(1);
  });

  it.only('given overdue path from 2 days ago, task should not send notification', async () => {
    // Creating path for 2 days ago with manual date adjustment because endpoint allows only yesterdays, today or future date
    const createPathRes = await user.pathAPI.createPath({
      title: 'Old path',
      description: 'Old path description',
      date: yesterday,
    });
    expect(createPathRes.status).toBe(201);
    const twoDaysAgoDate = new Date();
    twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
    const twoDaysAgo = fmt(twoDaysAgoDate);
    await pathRepository.update(createPathRes.body.id, { date: twoDaysAgo });

    await user.notificationAPI.registerPushToken({ token: 'fake-token-333' });

    const markOverdueTask = app.getProvider(MarkPastPathsAsOverdueTask);
    await markOverdueTask.execute();

    await task.execute();

    const emittedNotifications = notificationProvider.emitted;
    expect(emittedNotifications).toHaveLength(0);
  });
});
