import { Mapper } from '@building-blocks/infrastructure';
import { CompassChat } from '@domain/compass/domain/compass-chat';
import { CompassChatEntity } from '@domain/compass/infrastructure/entities/compass-chat.entity';

export class CompassChatMapper
  implements Mapper<CompassChat, CompassChatEntity>
{
  toDomain(entity: CompassChatEntity): CompassChat {
    return new CompassChat({
      id: entity.id,
      userProfileId: entity.userProfileId,
      intention: entity.intention,
      topic: entity.topic,
      status: entity.status,
      activeSpeaker: entity.activeSpeaker,
      turnsCount: entity.turnsCount,
      closeReason: entity.closeReason ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: CompassChat): CompassChatEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      userProfileId: props.userProfileId,
      intention: props.intention,
      topic: props.topic,
      status: props.status,
      activeSpeaker: props.activeSpeaker,
      turnsCount: props.turnsCount,
      closeReason: props.closeReason,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
