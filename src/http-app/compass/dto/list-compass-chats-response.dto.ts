import { PaginatedResponseDto } from '@building-blocks/application';
import { CompassChatDto } from './compass-chat.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ListCompassChatsResponseDto extends PaginatedResponseDto<CompassChatDto> {
  @ApiProperty({ type: [CompassChatDto] })
  declare items: CompassChatDto[];
}
