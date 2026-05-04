import { CompassChatMessage, CompassChatSpeaker } from '@domain/compass/domain';

export class CompassChatMessageDto {
  id: string;
  compassChatId: string;
  speaker: CompassChatSpeaker;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  turnIndex: number;
  metadata?: Record<string, any> | null;

  static fromEntity(entity: CompassChatMessage): CompassChatMessageDto {
    return {
      id: entity.getId(),
      compassChatId: entity.getCompassChatId(),
      speaker: entity.getSpeaker(),
      content: entity.getContent(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
      turnIndex: entity.getTurnIndex(),
      metadata: entity.getMetadata(),
    };
  }
}
