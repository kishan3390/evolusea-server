import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import { StartCompassChatPayloadDto } from './dto/start-compass-chat.dto';
import {
  CompassChat,
  CompassChatMessage,
  CompassTopics,
} from '@domain/compass/domain';
import { CompassChatDto } from './dto/compass-chat.dto';
import { ListCompassChatsResponseDto } from './dto/list-compass-chats-response.dto';
import { Pagination } from '@building-blocks/application';
import { ListCompassChatsQueryDto } from './dto/list-compass-chats-query.dto';
import { GetCompassChatQueryDto } from './dto/get-compass-chat-query.dto';
import { CompassChatWithMessageDto } from './dto/compass-chat-with-messages.dto';
import { CloseCompassChatPayloadDto } from './dto/close-compass-chat-payload.dto';
import { CompassChatStartOptionsDto } from './dto/compass-chat-start-options.dto';
import { GetCompassChatStartOptionsQueryDto } from './dto/get-compass-chat-start-options.dto';
import { CompassChatFacade } from '@domain/compass/compass-chat.facade';
import { CompassChatsQuotaDto } from './dto/compass-chats-quota.dto';

@Controller('users/me/compass/chats')
@RequiredAuth()
export class CompassChatController {
  constructor(private readonly compassChatFacade: CompassChatFacade) {}

  @HttpCode(HttpStatus.OK)
  @Post('/start')
  async startCompassChat(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: StartCompassChatPayloadDto,
  ): Promise<CompassChatWithMessageDto> {
    const quota = await this.compassChatFacade.getCompassChatsQuota({
      accountIsPremium: authUser.hasPremiumEntitlement,
      userProfileId: authUser.userProfileId,
    });
    if (!quota.create.isAllowed) {
      throw new ForbiddenException('Limit of chats reached');
    }

    const data = await this.startChat(payload, authUser);
    return CompassChatWithMessageDto.fromEntity(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/close')
  async closeCompassChat(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: CloseCompassChatPayloadDto,
  ): Promise<CompassChatWithMessageDto> {
    const data = await this.compassChatFacade.closeCompassChat({
      userProfileId: authUser.userProfileId,
      ...payload,
    });
    return CompassChatWithMessageDto.fromEntity(data);
  }

  @Get()
  async listCompassChats(
    @Query() query: ListCompassChatsQueryDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<ListCompassChatsResponseDto> {
    const results = await this.compassChatFacade.listCompassChats({
      userProfileId: authUser.userProfileId,
      status: query.status,
      pagination: Pagination.from(query),
    });
    return ListCompassChatsResponseDto.from(results, (compassChat) =>
      CompassChatDto.fromEntity({ compassChat }),
    );
  }

  // Has to be placed before the /:id route to avoid path conflict
  @Get('/quota')
  async getCompassChatQuota(
    @CurrentUser() authUser: AuthUser,
  ): Promise<CompassChatsQuotaDto> {
    const data = await this.compassChatFacade.getCompassChatsQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    return CompassChatsQuotaDto.fromEntity(data);
  }

  @Get('/:id')
  async getCompassChat(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
    @Query() query: GetCompassChatQueryDto,
  ): Promise<CompassChatWithMessageDto> {
    const data = await this.compassChatFacade.getCompassChat({
      userProfileId: authUser.userProfileId,
      compassChatId: id,
      includeMessages: query.includeMessages,
    });
    return CompassChatWithMessageDto.fromEntity(data);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/start/options')
  async getCompassChatStartOptions(
    @Query() query: GetCompassChatStartOptionsQueryDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<CompassChatStartOptionsDto> {
    const data = await this.compassChatFacade.getCompassChatStartOptions({
      userProfileId: authUser.userProfileId,
      ...query,
    });
    return CompassChatStartOptionsDto.fromEntity(data);
  }

  private startChat(
    payload: StartCompassChatPayloadDto,
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
        });
      case CompassTopics.PersonalNote: {
        return this.compassChatFacade.startCompassChatForPersonalNote({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          noteId: payload.details.noteId,
        });
      }
      case CompassTopics.PathItem:
        return this.compassChatFacade.startCompassChatForPathItem({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          pathId: payload.details.pathId,
        });
      case CompassTopics.CalendarEvent:
        return this.compassChatFacade.startCompassChatForCalendarEvent({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          date: payload.details.date,
        });
      case CompassTopics.Quote:
        return this.compassChatFacade.startCompassChatForQuote({
          userProfileId: authUser.userProfileId,
          accountId: authUser.accountId,
          intention: payload.intention,
          quoteId: payload.details.quoteId,
        });
    }
  }
}
