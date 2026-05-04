import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetNoteSummarizePromptQuery } from './get-note-summarize-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';

@Injectable()
export class GetNoteSummarizePromptQueryHandler
  implements QueryHandler<GetNoteSummarizePromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetNoteSummarizePromptQuery): string {
    const promptArgs = {
      note: {
        title: query.data.note.getTitle(),
        description: query.data.note.getDescription(),
        mood: query.data.note.getMood() ?? undefined,
        createdAt: query.data.note.getCreatedAt(),
        updatedAt: query.data.note.getUpdatedAt(),
      }
    };

    return this.promptRepository.getPrompt(
      PromptType.NoteSummarize,
      promptArgs,
      query.promptOverride,
    );
  }
}
