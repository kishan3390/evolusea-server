import { PaginatedList, Pagination } from '@building-blocks/application';
import { Note } from '../note';
import { Transaction } from '@building-blocks/infrastructure';

export interface FindNoteByParams {
  id: string;
  userProfileId: string;
}

export interface FindNotesByProfileAndIdsParams {
  notesIds: string[];
  userProfileId: string;
}

export interface NoteFilters {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface NoteCountFilters {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export abstract class NoteRepository {
  abstract create(entity: Note, tx?: Transaction): Promise<void>;
  abstract findOneBy(params: FindNoteByParams): Promise<Note | null>;
  abstract findManyByProfileAndIds(
    params: FindNotesByProfileAndIdsParams,
  ): Promise<Record<string, Note | null>>;
  abstract findLatestByUserProfileId(
    userProfileId: string,
  ): Promise<Note | null>;
  abstract delete(id: string): Promise<void>;
  abstract update(entity: Note, tx?: Transaction): Promise<void>;
  abstract list(
    filters: NoteFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<Note>>;
  abstract count(filters: NoteCountFilters): Promise<number>;
}
