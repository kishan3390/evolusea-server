import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { NoteRepository, NoteSummaryRepository } from '../../../domain';
import { SummarizeNoteCommand } from './summarize-note.command';
import { AiFacade, AiRoleEnum } from '../../../../../ai';
import { NoteSummary } from '@domain/note/domain/note-summary';
import { EntityIdGenerator } from '@building-blocks/domain';
import { PromptFacade } from '@domain/prompt/prompt.facade';

@Injectable()
export class SummarizeNoteCommandHandler
  implements CommandHandler<SummarizeNoteCommand>
{
  logger: LoggerService;

  constructor(
    private readonly aiFacade: AiFacade,
    private readonly noteRepository: NoteRepository,
    private readonly noteSummaryRepository: NoteSummaryRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly promptFacade: PromptFacade,
  ) {
    this.logger = new Logger(SummarizeNoteCommandHandler.name);
  }

  async handle({ noteId, userProfileId }: SummarizeNoteCommand): Promise<void> {
    const note = await this.noteRepository.findOneBy({
      userProfileId: userProfileId,
      id: noteId,
    });
    if (!note) {
      this.logger.log(`Note '${noteId}' not found`);
      return;
    }

    const summarizationPrompt = this.promptFacade.getNoteSummarizePrompt({
      data: {
        note,
      },
    });

    const aiChatResponse = await this.aiFacade.generate({
      maxTokens: 150,
      messages: [
        {
          role: AiRoleEnum.User,
          content: summarizationPrompt,
        },
      ],
    });

    if (!aiChatResponse.message) {
      this.logger.error('No message returned from AI', {
        userProfileId,
        noteId,
      });
      return;
    }

    const noteSummary = NoteSummary.create({
      noteId,
      content: aiChatResponse.message.content,
      entityIdGenerator: this.entityIdGenerator,
    });
    await this.noteSummaryRepository.upsertByNoteId(noteSummary);
  }
}
