import { PaginatedResponseDto } from '@building-blocks/application';
import { ApiProperty } from '@nestjs/swagger';
import { CompassChatMessageDto } from './compass-chat-message.dto';

export class ListCompassChatMessagesResponseDto extends PaginatedResponseDto<CompassChatMessageDto> {
  @ApiProperty({ type: [CompassChatMessageDto] })
  declare items: CompassChatMessageDto[];
}
