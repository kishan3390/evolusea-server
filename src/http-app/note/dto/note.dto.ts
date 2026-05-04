import { Note } from '../../../domain/note/domain';

export class NoteDto {
  id: string;
  title: string;
  description: string | null;
  mood: string | null;
  createdAt: Date;
  updatedAt: Date;
  anonymousSharingEnabled: boolean;

  static fromEntity(note: Note): NoteDto {
    return {
      id: note.getId(),
      title: note.getTitle(),
      description: note.getDescription(),
      mood: note.getMood(),
      createdAt: note.getCreatedAt(),
      updatedAt: note.getUpdatedAt(),
      anonymousSharingEnabled: note.isAnonymousSharingEnabled(),
    };
  }
}
