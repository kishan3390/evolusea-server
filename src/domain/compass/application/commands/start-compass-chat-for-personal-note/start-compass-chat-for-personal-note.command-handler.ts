import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { StartCompassChatForPersonalNoteCommand } from './index';
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
import { NoteFacade } from '@domain/note/note.facade';
import { AiRoleEnum } from '../../../../../ai';

@Injectable()
export class StartCompassChatForPersonalNoteCommandHandler
  implements CommandHandler<StartCompassChatForPersonalNoteCommand, CompassChat>
{
  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly compassChatMessageRepository: CompassChatMessageRepository,
    private readonly compassChatRepository: CompassChatRepository,
    private readonly compassConfigRepository: CompassConfigRepository,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly transactionManager: TransactionManager,
    private readonly generateAiCompassChatMessageCommandHandler: GenerateAiCompassChatMessageCommandHandler,
    private readonly noteFacade: NoteFacade,
    private readonly generateAiCompassChatContextMessageCommandHandler: GenerateAiCompassChatContextMessageCommandHandler,
    private readonly generateAiCompassChatWelcomeMessageCommandHandler: GenerateAiCompassChatWelcomeMessageCommandHandler,
  ) {}

  async handle(
    command: StartCompassChatForPersonalNoteCommand,
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
    const note = await this.noteFacade.getNote({
      userProfileId: command.userProfileId,
      id: command.noteId
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    const noteSummary = await this.noteFacade.getNoteSummary({
      noteId: command.noteId,
    });
    if (!noteSummary) {
      throw new ConflictException('Note has no summary generated yet');
    }

    const compassChat = CompassChat.create({
      userProfileId: command.userProfileId,
      entityIdGenerator: this.entityIdGenerator,
      status: CompassChatStatus.Active,
      activeSpeaker: CompassChatSpeaker.System,
      intention: command.intention,
      topic: CompassTopics.PersonalNote,
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
      const noteMessage = CompassChatMessage.create({
        compassChatId: compassChat.getId(),
        entityIdGenerator: this.entityIdGenerator,
        role: AiRoleEnum.User,
        speaker: CompassChatSpeaker.System,
        visibility: CompassChatMessageVisibility.Internal,
        content: `Personal note: ${noteSummary.getContent()}`,
        turnIndex: compassChat.getTurnsCount(),
      });
      await this.compassChatMessageRepository.create(noteMessage, tx);

      await this.generateAiCompassChatMessageCommandHandler.handle(
        {
          userProfileId: command.userProfileId,
          compassChat: compassChat,
          compassChatMessages: [
            contextMessage,
            welcomeInstructionMessage,
            noteMessage,
          ],
          developerOptions: command.developerOptions,
        },
        tx,
      );
    });

    return compassChat;
  }
}
