import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CommandHandler,
  Pagination,
  SortDirection,
} from '@building-blocks/application';
import { SendCompassChatMessageCommand } from './index';
import { AiRoleEnum } from '../../../../../ai';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';
import {
  CompassChatMessageRepository,
  CompassChatMessageVisibility,
  CompassChatRepository,
  CompassChatSpeaker,
  CompassChatStatus,
} from '@domain/compass/domain';
import { TransactionManager } from '@building-blocks/infrastructure';
import { PromptFacade } from '@domain/prompt/prompt.facade';
import { GenerateAiCompassChatMessageCommandHandler } from '@domain/compass/application/commands/generate-ai-compass-chat-message';
import { CompassConversationWindowingService } from '@domain/compass/application/services/compass-conversation-windowing.service';
import { TokenUsageService } from '@domain/ai-usage/services/token-usage.service';
import { CompassAbuseMonitorService, AbuseStatus } from '@domain/compass/application/services/compass-abuse-monitor.service';

@Injectable()
export class SendCompassChatMessageCommandHandler
  implements CommandHandler<SendCompassChatMessageCommand>
{
  private readonly logger = new Logger(SendCompassChatMessageCommandHandler.name);

  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly transactionManager: TransactionManager,
    private readonly promptFacade: PromptFacade,
    private readonly generateAiCompassChatMessageCommandHandler: GenerateAiCompassChatMessageCommandHandler,
    private readonly conversationWindowingService: CompassConversationWindowingService,
    private readonly tokenUsageService: TokenUsageService,
    private readonly abuseMonitorService: CompassAbuseMonitorService,
  ) {}

  async handle(
    command: SendCompassChatMessageCommand,
  ): Promise<void> {
    const compassChat = await this.compassChatRepository.findOneBy({
      userProfileId: command.userProfileId,
      compassChatId: command.compassChatId,
    });
    if (!compassChat) {
      throw new NotFoundException(`Compass chat not found`);
    }

    if (compassChat.getStatus() !== CompassChatStatus.Active) {
      throw new ConflictException(
        'Cannot add new message to the non active compass chat',
      );
    }

    if (compassChat.getActiveSpeaker() !== CompassChatSpeaker.User) {
      throw new ConflictException(
        'You cannot send new message, please wait for your turn',
      );
    }

    // Check abuse status before proceeding
    const abuseStatus = this.abuseMonitorService.getUserStatus(command.userProfileId);
    if (abuseStatus === AbuseStatus.Blocked) {
      throw new ForbiddenException(
        'Your chat access has been temporarily restricted. Please try again later.',
      );
    }
    if (abuseStatus === AbuseStatus.Suspended) {
      throw new ForbiddenException(
        'Your chat is temporarily paused. Take a moment to breathe — your compass will be ready soon.',
      );
    }

    // Check per-user daily token budget before proceeding with AI call
    const tier = command.hasPremiumEntitlement ? 'premium' : 'free';
    const hasBudget = await this.tokenUsageService.hasTokenBudget(
      command.userProfileId,
      tier,
    );
    if (!hasBudget) {
      this.logger.warn(
        `Daily token budget exceeded for user '${command.userProfileId}' (tier: ${tier})`,
      );
      throw new ForbiddenException(
        "You've used your daily message allowance. Take some time to reflect on today's conversations — your compass will be ready again tomorrow.",
      );
    }

    const compassChatMessages = await this.compassChatMessageRepository.list(
      { compassChatId: command.compassChatId },
      Pagination.unlimited(),
      [{ direction: SortDirection.ASC, field: 'createdAt' }],
    );
    compassChat.addMessages(compassChatMessages.items);

    // Build the conversation continuation prompt (ephemeral — not persisted to DB
    // to avoid accumulating duplicate prompts across turns)
    const compassConversationPrompt =
      this.promptFacade.getCompassConversationPrompt({
        promptOverride: command.developerOptions?.compassConversationOverride,
        data: {
          intention: compassChat.getIntention(),
          turnsCount: compassChat.getTurnsCount(),
        },
      });
    const conversationPromptMessage = CompassChatMessage.create({
      compassChatId: command.compassChatId,
      role: AiRoleEnum.User,
      speaker: CompassChatSpeaker.System,
      content: compassConversationPrompt,
      visibility: CompassChatMessageVisibility.Internal,
      turnIndex: compassChat.getTurnsCount(),
      entityIdGenerator: this.entityIdGenerator,
    });
    const userMessage = CompassChatMessage.create({
      compassChatId: command.compassChatId,
      role: AiRoleEnum.User,
      speaker: CompassChatSpeaker.User,
      content: command.content,
      visibility: CompassChatMessageVisibility.Public,
      turnIndex: compassChat.getTurnsCount(),
      entityIdGenerator: this.entityIdGenerator,
    });
    compassChat.addMessages([userMessage]);
    compassChat.setActiveSpeaker(CompassChatSpeaker.System);

    // Apply conversation history windowing to reduce token usage.
    // The conversation prompt is injected ephemerally — only the user message is persisted.
    const allMessages = [
      ...compassChatMessages.items,
      conversationPromptMessage,
      userMessage,
    ];
    const { messages: windowedMessages } =
      this.conversationWindowingService.applyWindowing(
        allMessages,
        compassChat.getTurnsCount(),
        compassChat.getIntention(),
      );

    await this.transactionManager.execute(async (tx) => {
      await this.compassChatRepository.update(compassChat, tx);
      await this.compassChatMessageRepository.create(userMessage, tx);
      await this.generateAiCompassChatMessageCommandHandler.handle(
        {
          userProfileId: command.userProfileId,
          compassChat: compassChat,
          compassChatMessages: windowedMessages,
          hasPremiumEntitlement: command.hasPremiumEntitlement,
          developerOptions: command.developerOptions,
        },
        tx,
      );
    });
  }
}
