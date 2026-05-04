import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, Pagination } from '@building-blocks/application';
import { GenerateAiCompassChatContextMessageCommand } from './index';
import { AiRoleEnum } from '../../../../../ai';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';
import { CompassChatMessageVisibility } from '@domain/compass/domain/enums/compass-chat-message-visibility.enum';
import {
  CompassChatMessageRepository,
  CompassChatSpeaker,
} from '@domain/compass/domain';
import { PromptFacade } from '@domain/prompt/prompt.facade';
import { CompassChatSummaryRepository } from '@domain/compass/domain/repositories/compass-chat-summary.repository';
import { PathFacade } from '@domain/path/path.facade';
import { NoteFacade } from '@domain/note/note.facade';

@Injectable()
export class GenerateAiCompassChatContextMessageCommandHandler
  implements
    CommandHandler<
      GenerateAiCompassChatContextMessageCommand,
      CompassChatMessage
    >
{
  private readonly logger = new Logger(GenerateAiCompassChatContextMessageCommandHandler.name);

  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly promptFacade: PromptFacade,
    private readonly compassChatSummaryRepository: CompassChatSummaryRepository,
    private readonly noteFacade: NoteFacade,
    private readonly pathFacade: PathFacade,
  ) {}

  async handle(
    command: GenerateAiCompassChatContextMessageCommand,
  ): Promise<CompassChatMessage> {
    const compassChatsSummaries = await this.compassChatSummaryRepository.list(
      { userProfileId: command.userProfile.getId() },
      Pagination.from({ page: 1, perPage: 3 }),
    );
    const notesSummaries = await this.noteFacade.listNotesSummaries({
      userProfileId: command.userProfile.getId(),
      pagination: Pagination.from({ page: 1, perPage: 3 }),
    });
    const paths = await this.pathFacade.listPaths({
      userProfileId: command.userProfile.getId(),
      pagination: Pagination.from({ page: 1, perPage: 3 }),
    });

    let compassContextTemplate = this.promptFacade.getCompassContextPrompt({
      promptOverride: command.developerOptions?.compassContextPromptOverride,
      data: {
        userProfile: command.userProfile,
        compassConfig: command.compassConfig,
        compassChat: command.compassChat,
        compassChatsSummaries: compassChatsSummaries.items,
        notesSummaries: notesSummaries.items,
        paths: paths.items,
      },
    });

    // Collapse multiple blank lines to a single blank line
    compassContextTemplate = compassContextTemplate.replace(/\n{3,}/g, '\n\n');

    // Log compiled prompt size for monitoring
    this.logger.log(
      `System prompt: ${compassContextTemplate.length} chars, ~${Math.ceil(compassContextTemplate.length / 4)} tokens`,
    );

    const contextMessage = CompassChatMessage.create({
      compassChatId: command.compassChat.getId(),
      entityIdGenerator: this.entityIdGenerator,
      role: AiRoleEnum.System,
      speaker: CompassChatSpeaker.System,
      visibility: CompassChatMessageVisibility.Internal,
      content: compassContextTemplate,
      turnIndex: command.compassChat.getTurnsCount(),
    });
    await this.compassChatMessageRepository.create(contextMessage, command.tx);

    return contextMessage;
  }
}
