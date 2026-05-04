import { Injectable } from '@nestjs/common';
import { Note } from './domain';
import {
  GetNoteSummaryQueryHandler,
  CreateNoteCommandHandler,
  GetNoteSummaryQuery,
  CreateNoteCommand,
  DeleteNoteCommandHandler,
  UpdateNoteCommandHandler,
  UpdateNoteCommand,
  DeleteNoteCommand,
  ListNotesSummariesQueryHandler,
  ListNotesSummariesQuery,
  ListNotesQueryHandler,
  ListNotesQuery,
  GetLatestUserNoteQueryHandler,
  GetLatestUserNoteQuery,
  GetNotesQuotaQueryResult,
  GetNoteQueryHandler,
  GetNoteQuery,
  GetNotesByIdsQueryHandler,
  GetNotesByIdsQuery,
} from './application';
import { PaginatedList } from '@building-blocks/application';
import { NoteSummary } from '@domain/note/domain/note-summary';
import {
  GetNotesQuotaQuery,
  GetNotesQuotaQueryHandler,
} from '@domain/note/application/queries/get-notes-quota';

@Injectable()
export class NoteFacade {
  constructor(
    private readonly getNoteQueryHandler: GetNoteQueryHandler,
    private readonly getNotesByIdsQueryHandler: GetNotesByIdsQueryHandler,
    private readonly getNoteSummaryQueryHandler: GetNoteSummaryQueryHandler,
    private readonly createNoteCommandHandler: CreateNoteCommandHandler,
    private readonly updateNoteCommandHandler: UpdateNoteCommandHandler,
    private readonly deleteNoteCommandHandler: DeleteNoteCommandHandler,
    private readonly listNotesQueryHandler: ListNotesQueryHandler,
    private readonly listNotesSummariesQueryHandler: ListNotesSummariesQueryHandler,
    private readonly getLatestUserNoteQueryHandler: GetLatestUserNoteQueryHandler,
    private readonly getNotesQuotaQueryHandler: GetNotesQuotaQueryHandler,
  ) {}

  async getNote(query: GetNoteQuery): Promise<Note | null> {
    return this.getNoteQueryHandler.handle(query);
  }

  async getNotesByIds(
    query: GetNotesByIdsQuery,
  ): Promise<Record<string, Note | null>> {
    return this.getNotesByIdsQueryHandler.handle(query);
  }

  async getNoteSummary(
    query: GetNoteSummaryQuery,
  ): Promise<NoteSummary | null> {
    return this.getNoteSummaryQueryHandler.handle(query);
  }

  async createNote(command: CreateNoteCommand): Promise<Note> {
    return this.createNoteCommandHandler.handle(command);
  }

  async updateNote(command: UpdateNoteCommand): Promise<Note> {
    return this.updateNoteCommandHandler.handle(command);
  }

  async deleteNote(command: DeleteNoteCommand): Promise<void> {
    return this.deleteNoteCommandHandler.handle(command);
  }

  async listNotes(query: ListNotesQuery): Promise<PaginatedList<Note>> {
    return this.listNotesQueryHandler.handle(query);
  }

  async getNotesQuota(
    query: GetNotesQuotaQuery,
  ): Promise<GetNotesQuotaQueryResult> {
    return this.getNotesQuotaQueryHandler.handle(query);
  }

  async listNotesSummaries(
    query: ListNotesSummariesQuery,
  ): Promise<PaginatedList<NoteSummary>> {
    return this.listNotesSummariesQueryHandler.handle(query);
  }

  async getLatestUserNote(query: GetLatestUserNoteQuery): Promise<Note | null> {
    return this.getLatestUserNoteQueryHandler.handle(query);
  }
}
