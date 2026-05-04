import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { SendPathNotificationCommand } from '@domain/path/application';
import { PathNotificationTranslations } from '@domain/path/infrastructure/tasks/path-notification-translations';
import { NotificationFacade } from '@domain/notification/notification.facade';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';

const NOTIFICATION_TYPES = {
  PATH_OVERDUE_REMINDER: 'PATH_OVERDUE_REMINDER',
};

@Injectable()
export class SendPathNotificationCommandHandler
  implements CommandHandler<SendPathNotificationCommand, void>
{
  private readonly logger = new Logger(SendPathNotificationCommandHandler.name);

  constructor(
    private readonly notificationFacade: NotificationFacade,
    private readonly userProfileFacade: UserProfileFacade,
  ) {}

  async handle(command: SendPathNotificationCommand): Promise<void> {
    const userProfile = await this.userProfileFacade.getByUserProfileId(
      command.userProfileId,
    );

    if (!userProfile) {
      this.logger.warn(
        `User profile not found for path ${command.pathId}, skipping notification`,
      );
      return;
    }

    const { title, body } = PathNotificationTranslations.getTranslation(
      userProfile.getLanguage(),
    );

    await this.notificationFacade.sendNotificationToUser({
      accountId: userProfile.getAccountId(),
      title,
      body,
      data: {
        pathId: command.pathId,
        type: NOTIFICATION_TYPES.PATH_OVERDUE_REMINDER,
      },
    });
  }
}
