import { Injectable } from '@nestjs/common';
import { NotificationPushTokenRepository } from '../../../domain';
import { UnregisterNotificationPushTokenCommand } from './unregister-push-token.command';

@Injectable()
export class UnregisterNotificationPushTokenCommandHandler {
  constructor(
    private readonly notificationPushTokenRepository: NotificationPushTokenRepository,
  ) {}

  async handle(command: UnregisterNotificationPushTokenCommand): Promise<void> {
    const existingToken =
      await this.notificationPushTokenRepository.findOneByToken(command.token);

    if (!existingToken) {
      return;
    }

    if (existingToken.getAccountId() !== command.accountId) {
      return;
    }

    await this.notificationPushTokenRepository.deleteByToken(command.token);
  }
}
