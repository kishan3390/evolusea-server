import { DistributedLockService } from '../../../../distributed-lock';
import { Cron } from '@nestjs/schedule';
import { PathRepository, PathStatus } from '../../domain';
import { Injectable, Logger } from '@nestjs/common';
import { SendPathNotificationCommandHandler } from '@domain/path/application';

const LOCK_KEY = 'trigger-path-notifications-task-lock';
const LOCK_EXPIRATION_TIME = 30_000; // 30 seconds

@Injectable()
export class TriggerPathNotificationsTask {
  private readonly logger = new Logger(TriggerPathNotificationsTask.name);

  constructor(
    private readonly distributedLock: DistributedLockService,
    private readonly pathRepository: PathRepository,
    private readonly sendPathNotificationCommandHandler: SendPathNotificationCommandHandler,
  ) {}

  // 2 AM UTC, which is 9AM (09:00) in Jakarta (UTC+7).
  @Cron('0 2 * * *', { timeZone: 'UTC' })
  async execute(): Promise<void> {
    await this.distributedLock.executeWithLock(
      LOCK_KEY,
      LOCK_EXPIRATION_TIME,
      () => this.triggerPathNotifications(),
    );
  }

  private async triggerPathNotifications(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const pathsToNotify = await this.pathRepository.findManyBy({
      isScheduledAt: yesterday.toISOString().split('T')[0],
      status: PathStatus.Overdue,
    });

    for (const path of pathsToNotify) {
      try {
        await this.sendPathNotificationCommandHandler.handle({
          userProfileId: path.getUserProfileId(),
          pathId: path.getId(),
        });
      } catch (error) {
        this.logger.error(
          `Failed to send notification for user ${path.getUserProfileId()} about path ${path.getId()}: ${error.toString()}`,
        );
      }
    }
  }
}
