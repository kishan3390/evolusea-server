import { DistributedLockService } from '../../../../distributed-lock';
import { Cron } from '@nestjs/schedule';
import { PathRepository, PathStatus } from '../../domain';
import { Injectable, Logger } from '@nestjs/common';

const LOCK_KEY = 'mark-past-paths-as-overdue-task-lock';
const LOCK_EXPIRATION_TIME = 30_000; // 30 seconds

@Injectable()
export class MarkPastPathsAsOverdueTask {
  private readonly logger = new Logger(MarkPastPathsAsOverdueTask.name);

  constructor(
    private readonly distributedLock: DistributedLockService,
    private readonly pathRepository: PathRepository,
  ) {}

  // 5 PM UTC, which is midnight (00:00) in Jakarta (UTC+7).
  @Cron('0 17 * * *', { timeZone: 'UTC' })
  async execute(): Promise<void> {
    this.logger.log(
      '[CRON] Trying to acquire lock to mark past paths as overdue...',
    );
    await this.distributedLock.executeWithLock(
      LOCK_KEY,
      LOCK_EXPIRATION_TIME,
      () => this.markPastPathsAsOverdue(),
    );
  }

  private async markPastPathsAsOverdue(): Promise<void> {
    this.logger.log('[CRON] Marking past paths as overdue...');
    const nowInUtc = new Date();
    const tomorrow = new Date(nowInUtc);
    tomorrow.setDate(nowInUtc.getDate() + 1);

    const overduePaths = await this.pathRepository.findManyBy({
      isScheduledBefore: tomorrow, // by querying for paths scheduled before tomorrow, we include all paths that were scheduled for yesterday in Jakarta time or earlier (when task is run at 5PM UTC, which is midnight in Jakarta the next day)
      status: PathStatus.Awaiting,
    });

    overduePaths.forEach((path) => {
      path.markAsOverdue();
    });

    await this.pathRepository.updateMany(overduePaths);
  }
}
