import {
  CompassChat,
  CompassChatCloseReasons,
  CompassChatSpeaker,
  CompassChatStatus,
  CompassIntentions,
  CompassTopics,
} from '@domain/compass/domain';

export class CompassChatDto {
  id: string;
  userProfileId: string;
  intention: CompassIntentions;
  topic: CompassTopics;
  status: CompassChatStatus;
  activeSpeaker: CompassChatSpeaker | null;
  turnsCount: number;
  closeReason?: CompassChatCloseReasons;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity({
    compassChat,
  }: {
    compassChat: CompassChat;
  }): CompassChatDto {
    return {
      id: compassChat.getId(),
      userProfileId: compassChat.getUserProfileId(),
      intention: compassChat.getIntention(),
      topic: compassChat.getTopic(),
      status: compassChat.getStatus(),
      activeSpeaker: compassChat.getActiveSpeaker(),
      turnsCount: compassChat.getTurnsCount(),
      closeReason: compassChat.getCloseReason(),
      createdAt: compassChat.getCreatedAt(),
      updatedAt: compassChat.getUpdatedAt(),
    };
  }
}
