import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { StartCompassChatForOpenQuestionCommand } from './index';
import { CompassChat } from '@domain/compass/domain/compass-chat';
import { EntityIdGenerator } from '@building-blocks/domain';
import {
  CompassChatMessageRepository,
  CompassChatMessageVisibility,
  CompassChatRepository,
  CompassChatSpeaker,
  CompassChatStatus,
  CompassConfigRepository,
  CompassTopics,
} from '@domain/compass/domain';
import { TransactionManager } from '@building-blocks/infrastructure';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';
import { GenerateAiCompassChatMessageCommandHandler } from '@domain/compass/application/commands/generate-ai-compass-chat-message';
import { GenerateAiCompassChatContextMessageCommandHandler } from '@domain/compass/application/commands/generate-ai-compass-chat-context-message';
import { GenerateAiCompassChatWelcomeMessageCommandHandler } from '@domain/compass/application/commands/generate-ai-compass-chat-welcome-message';
import { CompassWelcomeCacheService } from '@domain/compass/application/services/compass-welcome-cache.service';
import { AiRoleEnum } from '../../../../../ai';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';

@Injectable()
export class StartCompassChatForOpenQuestionCommandHandler
  implements CommandHandler<StartCompassChatForOpenQuestionCommand, CompassChat>
{
  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassConfigRepository: CompassConfigRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly transactionManager: TransactionManager,
    private readonly generateAiCompassChatMessageCommandHandler: GenerateAiCompassChatMessageCommandHandler,
    private readonly generateAiCompassChatContextMessageCommandHandler: GenerateAiCompassChatContextMessageCommandHandler,
    private readonly generateAiCompassChatWelcomeMessageCommandHandler: GenerateAiCompassChatWelcomeMessageCommandHandler,
    private readonly welcomeCacheService: CompassWelcomeCacheService,
  ) {}

  async handle(
    command: StartCompassChatForOpenQuestionCommand,
  ): Promise<CompassChat> {
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: command.accountId,
    });
    const compassConfig = await this.compassConfigRepository.findOneBy({
      userProfileId: command.userProfileId,
    });
    if (!compassConfig) {
      throw new BadRequestException('Compass chat has no config defined yet');
    }

    const compassChat = CompassChat.create({
      userProfileId: command.userProfileId,
      entityIdGenerator: this.entityIdGenerator,
      status: CompassChatStatus.Active,
      activeSpeaker: CompassChatSpeaker.System,
      intention: command.intention,
      topic: CompassTopics.OpenQuestion,
    });

    // Try welcome message cache for open-question topic
    const cacheKey = this.welcomeCacheService.buildCacheKey(
      userProfile.getBelief(),
      compassConfig.getPersonality(),
      command.intention,
    );
    const cachedWelcome = this.welcomeCacheService.get(
      cacheKey,
      userProfile.getUsername(),
    );

    await this.transactionManager.execute(async (tx) => {
      await this.compassChatRepository.create(compassChat, tx);
      const contextMessage =
        await this.generateAiCompassChatContextMessageCommandHandler.handle({
          userProfile,
          compassChat,
          compassConfig,
          tx,
        });
      const welcomeInstructionMessage =
        await this.generateAiCompassChatWelcomeMessageCommandHandler.handle({
          userProfile,
          compassChat,
          compassConfig,
          tx,
        });

      if (cachedWelcome) {
        // Use cached welcome message — skip AI call entirely (zero cost)
        const cachedMessage = CompassChatMessage.create({
          compassChatId: compassChat.getId(),
          role: AiRoleEnum.Assistant,
          speaker: CompassChatSpeaker.System,
          content: cachedWelcome,
          visibility: CompassChatMessageVisibility.Public,
          turnIndex: compassChat.getTurnsCount(),
          entityIdGenerator: this.entityIdGenerator,
        });
        compassChat.setActiveSpeaker(CompassChatSpeaker.User);
        await this.compassChatMessageRepository.create(cachedMessage, tx);
        await this.compassChatRepository.update(compassChat, tx);
      } else {
        // Cache miss — generate via AI
        await this.generateAiCompassChatMessageCommandHandler.handle(
          {
            userProfileId: command.userProfileId,
            compassChat: compassChat,
            compassChatMessages: [contextMessage, welcomeInstructionMessage],
            developerOptions: command.developerOptions,
          },
          tx,
        );

        // After generation, retrieve the public messages to find the AI welcome
        // and cache it for future open-question chats with same belief:personality:intention
        const publicMessages = compassChat.getPublicMessages();
        const aiWelcome = publicMessages.find(
          (m) => m.getRole() === AiRoleEnum.Assistant,
        );
        if (aiWelcome) {
          this.welcomeCacheService.set(cacheKey, aiWelcome.getContent());
        }
      }
    });

    return compassChat;
  }
}
