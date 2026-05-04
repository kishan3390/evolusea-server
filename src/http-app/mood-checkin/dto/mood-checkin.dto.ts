import { MoodCheckin } from '../../../domain/mood-checkin/domain';

export class MoodCheckinDto {
  id: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(moodCheckin: MoodCheckin): MoodCheckinDto {
    return {
      id: moodCheckin.getId(),
      mood: moodCheckin.getMood(),
      createdAt: moodCheckin.getCreatedAt(),
      updatedAt: moodCheckin.getUpdatedAt(),
    };
  }
}
