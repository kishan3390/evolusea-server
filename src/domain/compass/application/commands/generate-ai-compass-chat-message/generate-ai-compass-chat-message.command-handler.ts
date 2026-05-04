import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { GenerateAiCompassChatMessageCommand } from './index';
import {
  AiFacade,
  AiGenerateData,
  AiGenerateParamsToolFunction,
  AiReasoning,
  AiRoleEnum,
  AiToolSelectionModes,
  AiToolTypes,
} from '../../../../../ai';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';
import {
  CompassChat,
  CompassChatCloseReasons,
  CompassChatMessageRepository,
  CompassChatMessageVisibility,
  CompassChatRepository,
  CompassChatSpeaker,
} from '@domain/compass/domain';
import { EventEmitter } from '../../../../../event-emitter';
import { CompassChatClosedEvent } from '@domain/compass/application';
import { Transaction } from '@building-blocks/infrastructure';
import { PromptFacade } from '@domain/prompt/prompt.facade';
import { ConfigProvider } from '@config';
import { CompassOutputSafetyFilterService } from '@domain/compass/application/services/compass-output-safety-filter.service';

@Injectable()
export class GenerateAiCompassChatMessageCommandHandler
  implements CommandHandler<GenerateAiCompassChatMessageCommand>
{
  private readonly logger: Logger;

  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly eventEmitter: EventEmitter,
    private readonly aiFacade: AiFacade,
    private readonly promptFacade: PromptFacade,
    private readonly outputSafetyFilter: CompassOutputSafetyFilterService,
  ) {
    this.logger = new Logger(GenerateAiCompassChatMessageCommandHandler.name);
  }

  async handle(
    {
      userProfileId,
      compassChat,
      compassChatMessages,
      hasPremiumEntitlement,
      developerOptions,
    }: GenerateAiCompassChatMessageCommand,
    tx?: Transaction,
  ): Promise<void> {
    const isSoftLimitReached = this.isSoftLimitReached(compassChat);
    const isHardLimitReached = this.isHardLimitReached(compassChat);
    const closeFunctionDescription =
      this.promptFacade.getCompassChatCloseFunctionDescriptionPrompt({
        data: {},
      });

    if (isSoftLimitReached) {
      this.logger.log(
        `Soft limit reached for compass chat '${compassChat.getId()}' at turn '${compassChat.getTurnsCount()}'`,
      );

      compassChatMessages = await this.handleConversationTurnsSoftLimit(
        compassChat,
        compassChatMessages,
      );
    }

    let toolSelectionMode: AiToolSelectionModes | undefined;
    if (isHardLimitReached) {
      this.logger.warn(
        `Hard limit reached for compass chat '${compassChat.getId()}' at turn '${compassChat.getTurnsCount()}'`,
      );
      toolSelectionMode = AiToolSelectionModes.AnyCallRequired;
    }

    const tools: AiGenerateParamsToolFunction[] = [
      {
        type: AiToolTypes.Function,
        function: {
          name: 'close_compass_chat',
          description: closeFunctionDescription,
          parameters: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description:
                  'Goodbye message containing short conclusion send to the user',
              },
            },
            required: ['content'],
          },
        },
      },
    ];

    if (hasPremiumEntitlement) {
      const suggestSaveNoteDescription =
        this.promptFacade.getCompassSuggestSaveNoteFunctionDescriptionPrompt({
          data: {},
        });
      const suggestAddPathDescription =
        this.promptFacade.getCompassSuggestAddPathFunctionDescriptionPrompt({
          data: {},
        });

      tools.push(
        {
          type: AiToolTypes.Function,
          function: {
            name: 'suggest_save_as_note',
            description: suggestSaveNoteDescription,
            parameters: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description:
                    'A short, meaningful title for the note (max 60 characters)',
                },
                content: {
                  type: 'string',
                  description:
                    'The reflection or insight to save, written in the user\'s own words or paraphrased naturally',
                },
                mood: {
                  type: 'string',
                  enum: ['overwhelmed', 'uncertain', 'calm', 'motivated'],
                  description:
                    'The mood that best matches the user\'s current emotional state',
                },
              },
              required: ['title', 'content', 'mood'],
            },
          },
        },
        {
          type: AiToolTypes.Function,
          function: {
            name: 'suggest_add_to_path',
            description: suggestAddPathDescription,
            parameters: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description:
                    'A short, actionable title for the goal or step (max 60 characters)',
                },
                description: {
                  type: 'string',
                  description:
                    'A brief description of the action step or goal',
                },
                suggestedDays: {
                  type: 'number',
                  description:
                    'Suggested number of days from now to complete this goal (e.g. 7, 14, 30)',
                },
              },
              required: ['title', 'description', 'suggestedDays'],
            },
          },
        },
      );
    }

    const aiChatResponse = await this.aiFacade.generate({
      provider: developerOptions?.provider,
      model: developerOptions?.model,
      reasoning: developerOptions?.reasoning ?? AiReasoning.Medium,
      temperature: 0.75,
      maxTokens: 1500,
      messages: compassChatMessages.map((message) => ({
        role: message.getRole(),
        content: message.getContent(),
      })),
      tools,
      toolSelectionMode,
      tracking: {
        userId: userProfileId,
        chatId: compassChat.getId(),
        feature: 'compass-chat',
      },
    });

    await this.handleAiChatMessageResponse(aiChatResponse, compassChat, tx);
    await this.handleAiChatToolsResponse(
      aiChatResponse,
      compassChat,
      userProfileId,
      isHardLimitReached,
      tx,
    );
  }

  private isSoftLimitReached(compassChat: CompassChat): boolean {
    return (
      compassChat.getTurnsCount() ===
      ConfigProvider.domain.compass.turnsCountSoftLimit
    );
  }

  private async handleConversationTurnsSoftLimit(
    compassChat: CompassChat,
    compassChatMessages: CompassChatMessage[],
  ): Promise<CompassChatMessage[]> {
    const encourageChatClosePrompt =
      this.promptFacade.getCompassChatEncourageClosePrompt({
        data: {},
      });
    const encourageChatCloseMessage = CompassChatMessage.create({
      compassChatId: compassChat.getId(),
      role: AiRoleEnum.User,
      speaker: CompassChatSpeaker.System,
      content: encourageChatClosePrompt,
      visibility: CompassChatMessageVisibility.Internal,
      entityIdGenerator: this.entityIdGenerator,
      turnIndex: compassChat.getTurnsCount(),
    });
    await this.compassChatMessageRepository.create(encourageChatCloseMessage);
    return [...compassChatMessages, encourageChatCloseMessage];
  }

  private isHardLimitReached(compassChat: CompassChat): boolean {
    return (
      compassChat.getTurnsCount() >=
      ConfigProvider.domain.compass.turnsCountHardLimit
    );
  }

  private async handleAiChatMessageResponse(
    aiChatResponse: AiGenerateData,
    compassChat: CompassChat,
    tx?: Transaction,
  ) {
    if (!aiChatResponse.message) {
      return;
    }

    // Apply output safety filter before saving
    const filterResult = this.outputSafetyFilter.filter(
      aiChatResponse.message.content,
    );
    if (filterResult.wasFlagged) {
      this.logger.warn(
        `Output safety filter flagged response for chat '${compassChat.getId()}': ${filterResult.flags.join(', ')}`,
      );
    }

    const newMessage = CompassChatMessage.create({
      compassChatId: compassChat.getId(),
      role: aiChatResponse.message.role,
      speaker: CompassChatSpeaker.System,
      content: filterResult.content,
      visibility: CompassChatMessageVisibility.Public,
      entityIdGenerator: this.entityIdGenerator,
      turnIndex: compassChat.getTurnsCount(),
    });

    compassChat.setActiveSpeaker(CompassChatSpeaker.User);
    compassChat.addMessages([newMessage]);

    await this.compassChatMessageRepository.create(newMessage, tx);
    await this.compassChatRepository.update(compassChat, tx);
  }

  private async handleAiChatToolsResponse(
    aiChatResponse: AiGenerateData,
    compassChat: CompassChat,
    userProfileId: string,
    isHardLimitReached: boolean,
    tx?: Transaction,
  ): Promise<void> {
    await Promise.all(
      aiChatResponse.actions.map(async (action) => {
        if (action.type === 'close_compass_chat') {
          const newMessage = CompassChatMessage.create({
            compassChatId: compassChat.getId(),
            role: AiRoleEnum.Assistant,
            speaker: CompassChatSpeaker.System,
            content: action.args.content,
            visibility: CompassChatMessageVisibility.Public,
            entityIdGenerator: this.entityIdGenerator,
            turnIndex: compassChat.getTurnsCount(),
          });

          compassChat.close(
            isHardLimitReached
              ? CompassChatCloseReasons.LimitReached
              : CompassChatCloseReasons.GoalReached,
          );
          await this.compassChatMessageRepository.create(newMessage, tx);
          await this.compassChatRepository.update(compassChat, tx);
          this.eventEmitter.emit(
            new CompassChatClosedEvent({
              userProfileId,
              compassChatId: compassChat.getId(),
            }),
          );
        }

        if (action.type === 'suggest_save_as_note') {
          const suggestionMessage = CompassChatMessage.create({
            compassChatId: compassChat.getId(),
            role: AiRoleEnum.Assistant,
            speaker: CompassChatSpeaker.System,
            content: '',
            visibility: CompassChatMessageVisibility.Public,
            entityIdGenerator: this.entityIdGenerator,
            turnIndex: compassChat.getTurnsCount(),
            metadata: {
              type: 'suggestion',
              suggestionType: 'save_as_note',
              suggestion: action.args,
            },
          });

          compassChat.setActiveSpeaker(CompassChatSpeaker.User);
          compassChat.addMessages([suggestionMessage]);
          await this.compassChatMessageRepository.create(
            suggestionMessage,
            tx,
          );
          await this.compassChatRepository.update(compassChat, tx);
        }

        if (action.type === 'suggest_add_to_path') {
          const suggestionMessage = CompassChatMessage.create({
            compassChatId: compassChat.getId(),
            role: AiRoleEnum.Assistant,
            speaker: CompassChatSpeaker.System,
            content: '',
            visibility: CompassChatMessageVisibility.Public,
            entityIdGenerator: this.entityIdGenerator,
            turnIndex: compassChat.getTurnsCount(),
            metadata: {
              type: 'suggestion',
              suggestionType: 'add_to_path',
              suggestion: action.args,
            },
          });

          compassChat.setActiveSpeaker(CompassChatSpeaker.User);
          compassChat.addMessages([suggestionMessage]);
          await this.compassChatMessageRepository.create(
            suggestionMessage,
            tx,
          );
          await this.compassChatRepository.update(compassChat, tx);
        }
      }),
    );
  }
}
