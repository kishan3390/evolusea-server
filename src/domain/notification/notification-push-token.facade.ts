import { Injectable } from '@nestjs/common';
import {
  RegisterNotificationPushTokenCommand,
  RegisterNotificationPushTokenCommandHandler,
  UnregisterNotificationPushTokenCommand,
  UnregisterNotificationPushTokenCommandHandler,
} from './application';

@Injectable()
export class NotificationPushTokenFacade {
  constructor(
    private readonly registerNotificationPushTokenCommandHandler: RegisterNotificationPushTokenCommandHandler,
    private readonly unregisterNotificationPushTokenCommandHandler: UnregisterNotificationPushTokenCommandHandler,
  ) {}

  async registerPushToken(
    command: RegisterNotificationPushTokenCommand,
  ): Promise<void> {
    await this.registerNotificationPushTokenCommandHandler.handle(command);
  }

  async unregisterPushToken(
    command: UnregisterNotificationPushTokenCommand,
  ): Promise<void> {
    await this.unregisterNotificationPushTokenCommandHandler.handle(command);
  }
}
