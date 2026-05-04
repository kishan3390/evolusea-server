import { GetNotesQuotaQueryResult } from '@domain/note/application';

export class NotesQuotaDto {
  create: NotesQuotaCreateDto;

  static fromEntity(query: GetNotesQuotaQueryResult): NotesQuotaDto {
    return {
      create: {
        isAllowed: query.create.isAllowed,
        limit: query.create.limit,
        remaining: query.create.remaining,
      },
    };
  }
}

export class NotesQuotaCreateDto {
  isAllowed: boolean;
  limit: number | null;
  remaining: number | null;
}
