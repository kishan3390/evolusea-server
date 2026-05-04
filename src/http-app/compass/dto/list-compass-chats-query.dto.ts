import { CompassChatStatus } from '@domain/compass/domain';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginatedRequestDto } from '@building-blocks/application';

export class ListCompassChatsQueryDto extends PaginatedRequestDto {
  @IsOptional()
  @IsEnum(CompassChatStatus)
  status?: CompassChatStatus;
}
