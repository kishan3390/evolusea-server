import { Mapper } from '@building-blocks/infrastructure';
import { Note } from '../../domain';
import { NoteEntity } from '../entities';

export class NoteMapper implements Mapper<Note, NoteEntity> {
  toDomain(entity: NoteEntity): Note {
    return new Note({
      id: entity.id,
      userProfileId: entity.userProfileId,
      title: entity.title,
      description: entity.description,
      mood: entity.mood,
      anonymousSharingEnabled: entity.anonymousSharingEnabled,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Note): NoteEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      userProfileId: props.userProfileId,
      title: props.title,
      description: props.description,
      mood: props.mood,
      anonymousSharingEnabled: props.anonymousSharingEnabled,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
