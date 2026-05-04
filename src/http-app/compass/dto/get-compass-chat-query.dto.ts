import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '@building-blocks/application/transformers/to-boolean.transformer';

export class GetCompassChatQueryDto {
  @ApiPropertyOptional({
    description: 'When true returns chat with all available messages',
  })
  @ToBoolean()
  @IsOptional()
  @IsBoolean()
  includeMessages: boolean = false;
}
