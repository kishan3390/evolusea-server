import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import { CompassChatMessageFacade } from '@domain/compass/compass-chat-message.facade';
import { SendCompassChatMessagePayloadDto } from './dto/send-compass-chat-message.dto';
import { CompassChatMessageDto } from './dto/compass-chat-message.dto';
import {
  PaginatedRequestDto,
  Pagination,
} from '@building-blocks/application';
import { ListCompassChatMessagesResponseDto } from './dto/list-compass-chat-messages-response.dto';
import { CompassChatWithMessageDto } from './dto/compass-chat-with-messages.dto';
import { CompassChatRateLimitGuard } from './guards/compass-chat-rate-limit.guard';
import { CompassChatRepetitionGuard } from './guards/compass-chat-repetition.guard';

@Controller('users/me/compass/chats/:compassChatId/messages')
@RequiredAuth()
export class CompassChatMessagesController {
  constructor(
    private readonly compassChatMessageFacade: CompassChatMessageFacade,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('/send')
  @UseGuards(CompassChatRateLimitGuard, CompassChatRepetitionGuard)
  async sendCompassChatMessage(
    @UuidParam('compassChatId') compassChatId: string,
    @CurrentUser() authUser: AuthUser,
    @Body() payload: SendCompassChatMessagePayloadDto,
  ): Promise<CompassChatWithMessageDto> {
    const data = await this.compassChatMessageFacade.sendMessage({
      compassChatId: compassChatId,
      userProfileId: authUser.userProfileId,
      content: payload.content,
      hasPremiumEntitlement: authUser.hasPremiumEntitlement,
    });
    return CompassChatWithMessageDto.fromEntity(data);
  }

  @Get()
  async listCompassChatMessages(
    @UuidParam('compassChatId') compassChatId: string,
    @Query() pagination: PaginatedRequestDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<ListCompassChatMessagesResponseDto> {
    const compassChatMessages =
      await this.compassChatMessageFacade.listMessages({
        userProfileId: authUser.userProfileId,
        compassChatId,
        pagination: Pagination.from(pagination),
      });
    return ListCompassChatMessagesResponseDto.from(
      compassChatMessages,
      CompassChatMessageDto.fromEntity,
    );
  }
}
