import { CompassChatStartOptions } from '@domain/compass/domain/compass-chat-start-options';

export class CompassChatStartOptionsDto {
  isDailyQuoteAvailable: boolean;
  isPersonalNoteAvailable: boolean;
  isPathItemAvailable: boolean;
  isCalendarEventAvailable: boolean;

  static fromEntity(
    compassConfig: CompassChatStartOptions,
  ): CompassChatStartOptionsDto {
    return {
      isDailyQuoteAvailable: compassConfig.getIsDailyQuoteAvailable(),
      isPersonalNoteAvailable: compassConfig.getIsPersonalNoteAvailable(),
      isPathItemAvailable: compassConfig.getIsPathItemAvailable(),
      isCalendarEventAvailable: compassConfig.getIsCalendarEventAvailable(),
    };
  }
}
