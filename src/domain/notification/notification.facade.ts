import { Injectable } from '@nestjs/common';
import {
  SendNotificationToUserCommand,
  SendNotificationToUserCommandHandler,
} from './application/commands/send-notification-to-user';

@Injectable()
export class NotificationFacade {
  constructor(
    private readonly sendNotificationToUserCommandHandler: SendNotificationToUserCommandHandler,
  ) {}

  async sendNotificationToUser(
    command: SendNotificationToUserCommand,
  ): Promise<void> {
    await this.sendNotificationToUserCommandHandler.handle(command);
  }
}
