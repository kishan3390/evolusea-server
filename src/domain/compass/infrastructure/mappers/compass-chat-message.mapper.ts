import { Mapper } from '@building-blocks/infrastructure';
import { CompassChatMessage } from '@domain/compass/domain';
import { CompassChatMessageEntity } from '../entities/compass-chat-message.entity';

export class CompassChatMessageMapper
  implements Mapper<CompassChatMessage, CompassChatMessageEntity>
{
  toDomain(entity: CompassChatMessageEntity): CompassChatMessage {
    return new CompassChatMessage({
      id: entity.id,
      compassChatId: entity.compassChatId,
      role: entity.role,
      speaker: entity.speaker,
      visibility: entity.visibility,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      turnIndex: entity.turnIndex,
      metadata: entity.metadata,
    });
  }

  toPersistence(domain: CompassChatMessage): CompassChatMessageEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      compassChatId: props.compassChatId,
      role: props.role,
      speaker: props.speaker,
      visibility: props.visibility,
      content: props.content,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      turnIndex: props.turnIndex,
      metadata: props.metadata,
    };
  }
}
