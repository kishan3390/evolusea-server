import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { CompassChat } from '@domain/compass/domain/compass-chat';
import { EntityIdGenerator } from '@building-blocks/domain';
import {
  CompassChatMessage,
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
import { StartCompassChatForPathItemCommand } from '@domain/compass/application/commands/start-compass-chat-for-path-item/start-compass-chat-for-path-item.command';
import { PathFacade } from '@domain/path/path.facade';
import { AiRoleEnum } from '../../../../../ai';

@Injectable()
export class StartCompassChatForPathItemCommandHandler
  implements CommandHandler<StartCompassChatForPathItemCommand, CompassChat>
{
  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly compassConfigRepository: CompassConfigRepository,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly transactionManager: TransactionManager,
    private readonly generateAiCompassChatMessageCommandHandler: GenerateAiCompassChatMessageCommandHandler,
    private readonly pathFacade: PathFacade,
    private readonly generateAiCompassChatContextMessageCommandHandler: GenerateAiCompassChatContextMessageCommandHandler,
    private readonly generateAiCompassChatWelcomeMessageCommandHandler: GenerateAiCompassChatWelcomeMessageCommandHandler,
  ) {}

  async handle(
    command: StartCompassChatForPathItemCommand,
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
    const path = await this.pathFacade.getPath({
      id: command.pathId,
      userProfileId: command.userProfileId,
    });
    if (!path) {
      throw new NotFoundException('Path item not found');
    }

    const compassChat = CompassChat.create({
      userProfileId: command.userProfileId,
      entityIdGenerator: this.entityIdGenerator,
      status: CompassChatStatus.Active,
      activeSpeaker: CompassChatSpeaker.System,
      intention: command.intention,
      topic: CompassTopics.PathItem,
    });

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
      const pathMessage = CompassChatMessage.create({
        compassChatId: compassChat.getId(),
        entityIdGenerator: this.entityIdGenerator,
        role: AiRoleEnum.User,
        speaker: CompassChatSpeaker.System,
        visibility: CompassChatMessageVisibility.Internal,
        content: `Path item
        Title: ${path.getTitle()}
        Description: ${path.getDescription()}`,
        turnIndex: compassChat.getTurnsCount(),
      });
      await this.compassChatMessageRepository.create(pathMessage, tx);

      await this.generateAiCompassChatMessageCommandHandler.handle(
        {
          userProfileId: command.userProfileId,
          compassChat: compassChat,
          compassChatMessages: [
            contextMessage,
            welcomeInstructionMessage,
            pathMessage,
          ],
          developerOptions: command.developerOptions,
        },
        tx,
      );
    });

    return compassChat;
  }
}
