import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { PathStatus } from '../../../src/domain/path/domain';
import { MarkPastPathsAsOverdueTask } from '../../../src/domain/path/infrastructure/tasks/mark-past-paths-as-overdue.task';

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('Mark past paths as overdue task (e2e)', () => {
  let app: TestApp;
  let user: SignedInAccount;
  let task: MarkPastPathsAsOverdueTask;

  beforeEach(async (context) => {
    app = context.app;
    task = app.getProvider(MarkPastPathsAsOverdueTask);

    user = await app.signedInVerifiedAccount();
  });

  it('given 3 created paths with "awaiting status", one yesterday (UTC time), one today (UTC time), and one tomorrow (UTC time), task should mark yesterdays and todays path as overdue (today is already yesterday in Jakarta time)', async () => {
    const now = new Date();

    const todayDate = new Date(now);
    const yesterdayDate = new Date(now);
    const tomorrowDate = new Date(now);

    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const today = fmt(todayDate);
    const yesterday = fmt(yesterdayDate);
    const tomorrow = fmt(tomorrowDate);

    const createYesterdayRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: yesterday,
    });
    expect(createYesterdayRes.status).toEqual(HttpStatus.CREATED);

    const createTodayRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: today,
    });
    expect(createTodayRes.status).toEqual(HttpStatus.CREATED);

    const createTomorrowRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: tomorrow,
    });

    expect(createTomorrowRes.status).toEqual(HttpStatus.CREATED);

    await task.execute();

    const pathYesterdayRes = await user.pathAPI.getPath(
      createYesterdayRes.body.id,
    );
    expect(pathYesterdayRes.body.status).toEqual(PathStatus.Overdue);

    const pathTodayRes = await user.pathAPI.getPath(createTodayRes.body.id);
    expect(pathTodayRes.body.status).toEqual(PathStatus.Overdue);

    const pathTomorrowRes = await user.pathAPI.getPath(
      createTomorrowRes.body.id,
    );
    expect(pathTomorrowRes.body.status).toEqual(PathStatus.Awaiting);
  });

  it('given 2 created paths for yesterday, one with completed status and one with awaiting status, task should mark only the awaiting path as overdue', async () => {
    const now = new Date();

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = fmt(yesterdayDate);

    const createCompletedPathRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: yesterday,
    });
    expect(createCompletedPathRes.status).toEqual(HttpStatus.CREATED);
    const completeRes = await user.pathAPI.completePath(
      createCompletedPathRes.body.id,
    );
    expect(completeRes.status).toEqual(HttpStatus.CREATED);

    const createAwaitingPathRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: yesterday,
    });
    expect(createAwaitingPathRes.status).toEqual(HttpStatus.CREATED);

    await task.execute();

    const completedPathRes = await user.pathAPI.getPath(
      createCompletedPathRes.body.id,
    );
    expect(completedPathRes.body.status).toEqual(PathStatus.Completed);

    const awaitingPathRes = await user.pathAPI.getPath(
      createAwaitingPathRes.body.id,
    );
    expect(awaitingPathRes.body.status).toEqual(PathStatus.Overdue);
  });
});
