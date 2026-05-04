import { CompassChat, CompassChatMessage } from '@domain/compass/domain';
import { CompassChatMessageDto } from './compass-chat-message.dto';
import { CompassChatDto } from './compass-chat.dto';

export class CompassChatWithMessageDto extends CompassChatDto {
  messages?: CompassChatMessageDto[];

  static fromEntity({
    compassChat,
    compassChatMessages,
  }: {
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }): CompassChatWithMessageDto {
    const dto: CompassChatWithMessageDto = CompassChatDto.fromEntity({
      compassChat,
    });

    if (compassChatMessages.length) {
      dto.messages = compassChatMessages.map((message) =>
        CompassChatMessageDto.fromEntity(message),
      );
    }

    return dto;
  }
}
