import { Mapper } from '@building-blocks/infrastructure';
import { CompassChatSummaryEntity } from '@domain/compass/infrastructure/entities/compass-chat-summary.entity';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';

export class CompassChatSummaryMapper
  implements Mapper<CompassChatSummary, CompassChatSummaryEntity>
{
  toDomain(entity: CompassChatSummaryEntity): CompassChatSummary {
    return new CompassChatSummary({
      id: entity.id,
      compassChatId: entity.compassChatId,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: CompassChatSummary): CompassChatSummaryEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      compassChatId: domain.getCompassChatId(),
      content: domain.getContent(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
