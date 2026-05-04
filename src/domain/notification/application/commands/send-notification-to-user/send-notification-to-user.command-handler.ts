import { Injectable } from '@nestjs/common';
import { SendNotificationToUserCommand } from './send-notification-to-user.command';
import { CommandHandler } from '@building-blocks/application';
import {
  NotificationProvider,
  NotificationPushTokenRepository,
} from '../../../domain';

@Injectable()
export class SendNotificationToUserCommandHandler
  implements CommandHandler<SendNotificationToUserCommand, void>
{
  constructor(
    private readonly notificationProvider: NotificationProvider,
    private readonly pushTokensRepository: NotificationPushTokenRepository,
  ) {}

  async handle({
    accountId,
    title,
    body,
    data,
  }: SendNotificationToUserCommand) {
    const pushTokens =
      await this.pushTokensRepository.findManyByAccountId(accountId);
    const notifications = pushTokens.map((pushToken) => ({
      token: pushToken.getToken(),
      title,
      body,
      data,
    }));
    const { invalidPushTokenValues } =
      await this.notificationProvider.emit(notifications);
    if (invalidPushTokenValues.length > 0) {
      await this.cleanupInvalidTokens(invalidPushTokenValues);
    }
  }

  private async cleanupInvalidTokens(
    invalidPushTokenValues: string[],
  ): Promise<void> {
    await this.pushTokensRepository.deleteByTokenValues(invalidPushTokenValues);
  }
}
