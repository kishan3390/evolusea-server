import { PromptQuery } from '../../prompt.query';
import { Note } from '@domain/note/domain';

export interface GetNoteSummarizePromptQueryData {
  note: Note;
}

export type GetNoteSummarizePromptQuery =
  PromptQuery<GetNoteSummarizePromptQueryData>;
