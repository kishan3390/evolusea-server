import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { GenerateAiCompassChatWelcomeMessageCommand } from './index';
import { AiRoleEnum } from '../../../../../ai';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';
import { CompassChatMessageVisibility } from '@domain/compass/domain/enums/compass-chat-message-visibility.enum';
import {
  CompassChatMessageRepository,
  CompassChatSpeaker,
} from '@domain/compass/domain';
import { PromptFacade } from '@domain/prompt/prompt.facade';

@Injectable()
export class GenerateAiCompassChatWelcomeMessageCommandHandler
  implements
    CommandHandler<
      GenerateAiCompassChatWelcomeMessageCommand,
      CompassChatMessage
    >
{
  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly promptFacade: PromptFacade,
  ) {}

  async handle(
    command: GenerateAiCompassChatWelcomeMessageCommand,
  ): Promise<CompassChatMessage> {
    const compassWelcomeInstructionTemplate =
      this.promptFacade.getCompassWelcomePrompt({
        promptOverride: command.developerOptions?.compassWelcomePromptOverride,
        data: {
          userProfile: command.userProfile,
          compassConfig: command.compassConfig,
          compassChat: command.compassChat,
        },
      });
    const welcomeInstructionMessage = CompassChatMessage.create({
      compassChatId: command.compassChat.getId(),
      entityIdGenerator: this.entityIdGenerator,
      role: AiRoleEnum.User,
      speaker: CompassChatSpeaker.System,
      visibility: CompassChatMessageVisibility.Internal,
      content: compassWelcomeInstructionTemplate,
      turnIndex: command.compassChat.getTurnsCount(),
    });

    await this.compassChatMessageRepository.create(
      welcomeInstructionMessage,
      command.tx,
    );
    return welcomeInstructionMessage;
  }
}
