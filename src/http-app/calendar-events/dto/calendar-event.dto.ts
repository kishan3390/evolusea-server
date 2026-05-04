import { CalendarEvent } from '@domain/calendar/domain';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';
import { NotFoundException } from '@nestjs/common';

export class CalendarEventDto {
  id: string;
  date: string;
  language: Languages;
  belief: BeliefSystems;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: CalendarEvent): CalendarEventDto {
    const translation = entity.getTranslations()[0];
    if (!translation) {
      throw new NotFoundException('Translation not found');
    }

    return {
      id: entity.getId(),
      date: entity.getDate(),
      name: translation.getName(),
      description: translation.getDescription(),
      belief: entity.getBelief(),
      language: translation.getLanguage(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
