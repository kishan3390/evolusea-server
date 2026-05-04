import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteEntity } from './infrastructure/entities';
import { NoteRepository, NoteSummaryRepository } from './domain';
import { PostgresNoteRepository } from './infrastructure/repositories/postgres-note.repository';
import { NoteFacade } from './note.facade';
import {
  CreateNoteCommandHandler,
  DeleteNoteCommandHandler,
  GetLatestUserNoteQueryHandler,
  GetNoteQueryHandler,
  GetNotesByIdsQueryHandler,
  GetNoteSummaryQueryHandler,
  ListNotesQueryHandler,
  ListNotesSummariesQueryHandler,
  NoteCreatedEventHandler,
  NoteUpdatedEventHandler,
  SummarizeNoteCommandHandler,
  UpdateNoteCommandHandler,
} from './application';
import { NoteSummaryEntity } from '@domain/note/infrastructure/entities/note-summary.entity';
import { PostgresNoteSummaryRepository } from '@domain/note/infrastructure/repositories/postgres-note-summary.repository';
import { AiModule } from '../../ai';
import { PromptModule } from '@domain/prompt/prompt.module';
import { EventEmitterModule } from '../../event-emitter';
import { GetNotesQuotaQueryHandler } from '@domain/note/application/queries/get-notes-quota';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoteEntity, NoteSummaryEntity]),
    AiModule,
    PromptModule,
    EventEmitterModule,
  ],
  providers: [
    {
      provide: NoteRepository,
      useClass: PostgresNoteRepository,
    },
    {
      provide: NoteSummaryRepository,
      useClass: PostgresNoteSummaryRepository,
    },
    CreateNoteCommandHandler,
    GetNoteQueryHandler,
    GetNotesByIdsQueryHandler,
    GetNoteSummaryQueryHandler,
    UpdateNoteCommandHandler,
    DeleteNoteCommandHandler,
    ListNotesQueryHandler,
    ListNotesSummariesQueryHandler,
    GetLatestUserNoteQueryHandler,
    NoteFacade,
    NoteCreatedEventHandler,
    NoteUpdatedEventHandler,
    SummarizeNoteCommandHandler,
    GetNoteSummaryQueryHandler,
    GetNotesQuotaQueryHandler,
  ],
  exports: [NoteFacade],
})
export class NoteModule {}
