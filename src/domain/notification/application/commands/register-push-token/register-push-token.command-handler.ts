import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import {
  NotificationPushToken,
  NotificationPushTokenRepository,
} from '../../../domain';
import { EntityIdGenerator } from '@building-blocks/domain';
import { RegisterNotificationPushTokenCommand } from './register-push-token.command';

@Injectable()
export class RegisterNotificationPushTokenCommandHandler
  implements
    CommandHandler<RegisterNotificationPushTokenCommand, NotificationPushToken>
{
  constructor(
    private readonly notificationPushTokenRepository: NotificationPushTokenRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {}

  async handle(
    command: RegisterNotificationPushTokenCommand,
  ): Promise<NotificationPushToken> {
    const existingToken =
      await this.notificationPushTokenRepository.findOneByToken(command.token);

    // token already registered for this account
    if (existingToken?.getAccountId() === command.accountId) {
      return existingToken;
    }

    // token registered for different account
    if (existingToken) {
      await this.notificationPushTokenRepository.deleteByToken(command.token);
    }

    const pushToken = NotificationPushToken.create({
      accountId: command.accountId,
      token: command.token,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.notificationPushTokenRepository.create(pushToken);
    return pushToken;
  }
}
