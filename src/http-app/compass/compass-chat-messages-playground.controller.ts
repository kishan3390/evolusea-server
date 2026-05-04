import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import { CompassChatMessageFacade } from '@domain/compass/compass-chat-message.facade';
import { SendCompassChatMessagePlaygroundPayloadDto } from './dto/send-compass-chat-message-playground.dto';
import { ApiTags } from '@nestjs/swagger';
import { DisableBodyPromptInjectionSanitizer } from '../decorators/disable-prompt-injection-sanitizer.decorator';
import { CompassChatWithMessageDto } from './dto/compass-chat-with-messages.dto';

@Controller('/playground/users/me/compass/chats/:compassChatId/messages')
@ApiTags('Playground')
@RequiredAuth()
export class CompassChatMessagesPlaygroundController {
  constructor(
    private readonly compassChatMessageFacade: CompassChatMessageFacade,
  ) {}

  @DisableBodyPromptInjectionSanitizer()
  @HttpCode(HttpStatus.OK)
  @Post('/send')
  async sendCompassChatMessage(
    @UuidParam('compassChatId') compassChatId: string,
    @CurrentUser() authUser: AuthUser,
    @Body() payload: SendCompassChatMessagePlaygroundPayloadDto,
  ): Promise<CompassChatWithMessageDto> {
    const data = await this.compassChatMessageFacade.sendMessage({
      compassChatId: compassChatId,
      userProfileId: authUser.userProfileId,
      content: payload.content,
      developerOptions: payload.developerOptions,
    });
    return CompassChatWithMessageDto.fromEntity(data);
  }
}
