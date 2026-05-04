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
import { StartCompassChatForQuoteCommand } from '@domain/compass/application/commands/start-compass-chat-for-quote/start-compass-chat-for-quote.command';
import { AiRoleEnum } from '../../../../../ai';
import { QuoteFacade } from '@domain/quote/quote.facade';

@Injectable()
export class StartCompassChatForQuoteCommandHandler
  implements CommandHandler<StartCompassChatForQuoteCommand, CompassChat>
{
  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassConfigRepository: CompassConfigRepository,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly transactionManager: TransactionManager,
    private readonly quoteFacade: QuoteFacade,
    private readonly generateAiCompassChatMessageCommandHandler: GenerateAiCompassChatMessageCommandHandler,
    private readonly generateAiCompassChatContextMessageCommandHandler: GenerateAiCompassChatContextMessageCommandHandler,
    private readonly generateAiCompassChatWelcomeMessageCommandHandler: GenerateAiCompassChatWelcomeMessageCommandHandler,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
  ) {}

  async handle(command: StartCompassChatForQuoteCommand): Promise<CompassChat> {
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: command.accountId,
    });
    const compassConfig = await this.compassConfigRepository.findOneBy({
      userProfileId: command.userProfileId,
    });
    if (!compassConfig) {
      throw new BadRequestException('Compass chat has no config defined yet');
    }
    const quote = await this.quoteFacade.getQuoteById({
      userProfileId: command.userProfileId,
      quoteId: command.quoteId,
    });
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    const compassChat = CompassChat.create({
      userProfileId: command.userProfileId,
      entityIdGenerator: this.entityIdGenerator,
      status: CompassChatStatus.Active,
      activeSpeaker: CompassChatSpeaker.System,
      intention: command.intention,
      topic: CompassTopics.Quote,
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
      const quoteMessage = CompassChatMessage.create({
        compassChatId: compassChat.getId(),
        entityIdGenerator: this.entityIdGenerator,
        role: AiRoleEnum.User,
        speaker: CompassChatSpeaker.System,
        visibility: CompassChatMessageVisibility.Internal,
        content: `Quote: ${quote.getContent()}`,
        turnIndex: compassChat.getTurnsCount(),
      });
      await this.compassChatMessageRepository.create(quoteMessage, tx);

      await this.generateAiCompassChatMessageCommandHandler.handle(
        {
          userProfileId: command.userProfileId,
          compassChat: compassChat,
          compassChatMessages: [
            contextMessage,
            welcomeInstructionMessage,
            quoteMessage,
          ],
          developerOptions: command.developerOptions,
        },
        tx,
      );
    });

    return compassChat;
  }
}
