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
import { AiRoleEnum } from '../../../../../ai';
import { CalendarFacade } from '@domain/calendar/calendar.facade';
import { StartCompassChatForCalendarEventCommand } from '@domain/compass/application';

@Injectable()
export class StartCompassChatForCalendarEventCommandHandler
  implements
    CommandHandler<StartCompassChatForCalendarEventCommand, CompassChat>
{
  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly compassConfigRepository: CompassConfigRepository,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly transactionManager: TransactionManager,
    private readonly generateAiCompassChatMessageCommandHandler: GenerateAiCompassChatMessageCommandHandler,
    private readonly generateAiCompassChatContextMessageCommandHandler: GenerateAiCompassChatContextMessageCommandHandler,
    private readonly generateAiCompassChatWelcomeMessageCommandHandler: GenerateAiCompassChatWelcomeMessageCommandHandler,
    private readonly calendarFacade: CalendarFacade,
  ) {}

  async handle(
    command: StartCompassChatForCalendarEventCommand,
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
    const calendarEvent = await this.calendarFacade.getByDateAndUserProfileId({
      userProfileId: command.userProfileId,
      date: command.date,
    });
    if (!calendarEvent) {
      throw new NotFoundException('Calendar event not found');
    }
    const calendarEventTranslation =
      calendarEvent.getTranslation(userProfile.getLanguage()) ||
      calendarEvent.getTranslations()[0];
    if (!calendarEventTranslation) {
      throw new NotFoundException('Calendar event translation not found');
    }

    const compassChat = CompassChat.create({
      userProfileId: command.userProfileId,
      entityIdGenerator: this.entityIdGenerator,
      status: CompassChatStatus.Active,
      activeSpeaker: CompassChatSpeaker.System,
      intention: command.intention,
      topic: CompassTopics.CalendarEvent,
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
      const calendarEventMessage = CompassChatMessage.create({
        compassChatId: compassChat.getId(),
        entityIdGenerator: this.entityIdGenerator,
        role: AiRoleEnum.User,
        speaker: CompassChatSpeaker.System,
        visibility: CompassChatMessageVisibility.Internal,
        content: `Calendar event
        Name: ${calendarEventTranslation.getName()}
        Description: ${calendarEventTranslation.getDescription()}`,
        turnIndex: compassChat.getTurnsCount(),
      });
      await this.compassChatMessageRepository.create(calendarEventMessage, tx);

      await this.generateAiCompassChatMessageCommandHandler.handle(
        {
          userProfileId: command.userProfileId,
          compassChat: compassChat,
          compassChatMessages: [
            contextMessage,
            welcomeInstructionMessage,
            calendarEventMessage,
          ],
          developerOptions: command.developerOptions,
        },
        tx,
      );
    });

    return compassChat;
  }
}
