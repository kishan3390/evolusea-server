import { Injectable } from '@nestjs/common';
import {
  GetCompassChatQueryHandler,
  ListCompassChatMessagesQuery,
  ListCompassChatMessagesQueryHandler,
  SendCompassChatMessageCommand,
  SendCompassChatMessageCommandHandler,
} from '@domain/compass/application';
import { CompassChat, CompassChatMessage } from '@domain/compass/domain';
import { PaginatedList } from '@building-blocks/application';

@Injectable()
export class CompassChatMessageFacade {
  constructor(
    private readonly sendCompassChatMessageCommandHandler: SendCompassChatMessageCommandHandler,
    private readonly listCompassChatMessagesQueryHandler: ListCompassChatMessagesQueryHandler,
    private readonly getCompassChatQueryHandler: GetCompassChatQueryHandler,
  ) {}

  async sendMessage(
    command: SendCompassChatMessageCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    await this.sendCompassChatMessageCommandHandler.handle(command);
    return this.getCompassChatQueryHandler.handle({
      compassChatId: command.compassChatId,
      userProfileId: command.userProfileId,
      includeMessages: true,
    });
  }

  listMessages(
    command: ListCompassChatMessagesQuery,
  ): Promise<PaginatedList<CompassChatMessage>> {
    return this.listCompassChatMessagesQueryHandler.handle(command);
  }
}
