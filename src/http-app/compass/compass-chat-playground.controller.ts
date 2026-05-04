import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser, RequiredAuth } from '../decorators';
import { AuthUser } from '../authentication';
import { StartCompassChatPlaygroundPayloadDto } from './dto/start-compass-chat-playground.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  CompassChat,
  CompassChatMessage,
  CompassTopics,
} from '@domain/compass/domain';
import { CompassChatDto } from './dto/compass-chat.dto';
import { DisableBodyPromptInjectionSanitizer } from '../decorators/disable-prompt-injection-sanitizer.decorator';
import { CompassChatWithMessageDto } from './dto/compass-chat-with-messages.dto';
import { CompassChatFacade } from '@domain/compass/compass-chat.facade';

@Controller('/playground/users/me/compass/chats')
@ApiTags('Playground')
@RequiredAuth()
export class CompassChatPlaygroundController {
  constructor(private readonly compassChatFacade: CompassChatFacade) {}

  @DisableBodyPromptInjectionSanitizer()
  @HttpCode(HttpStatus.OK)
  @Post('/start')
  async createCompassChat(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: StartCompassChatPlaygroundPayloadDto,
  ): Promise<CompassChatDto> {
    const data = await this.startChat(payload, authUser);
    return CompassChatWithMessageDto.fromEntity(data);
  }

  private startChat(
    payload: StartCompassChatPlaygroundPayloadDto,
    authUser: AuthUser,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    switch (payload.details.topic) {
      case CompassTopics.OpenQuestion:
        return this.compassChatFacade.startCompassChatForOpenQuestion({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          developerOptions: payload.developerOptions,
        });
      case CompassTopics.PersonalNote: {
        return this.compassChatFacade.startCompassChatForPersonalNote({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          noteId: payload.details.noteId,
          developerOptions: payload.developerOptions,
        });
      }
      case CompassTopics.PathItem:
        return this.compassChatFacade.startCompassChatForPathItem({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          pathId: payload.details.pathId,
          developerOptions: payload.developerOptions,
        });
      case CompassTopics.CalendarEvent:
        return this.compassChatFacade.startCompassChatForCalendarEvent({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          date: payload.details.date,
          developerOptions: payload.developerOptions,
        });
      case CompassTopics.Quote:
        return this.compassChatFacade.startCompassChatForQuote({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          quoteId: payload.details.quoteId,
          developerOptions: payload.developerOptions,
        });
    }
  }
}
