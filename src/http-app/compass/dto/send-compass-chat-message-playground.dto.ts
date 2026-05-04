import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SendCompassChatMessagePayloadDto } from './send-compass-chat-message.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AiProviders, AiReasoning } from '../../../ai';

export class SendCompassChatMessageDeveloperOptionsPlaygroundPayloadDto {
  @ApiPropertyOptional({
    description: 'Overrides predefined AI model',
    default: 'gemini-2.5-flash',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  model?: string;

  @ApiPropertyOptional({
    description: 'Overrides predefined AI provider',
    enum: AiProviders,
    default: AiProviders.Gemini,
  })
  @IsOptional()
  @IsEnum(AiProviders)
  provider?: AiProviders;

  @ApiPropertyOptional({
    description: 'Overrides predefined AI reasoning',
    enum: AiReasoning,
  })
  @IsOptional()
  @IsEnum(AiReasoning)
  reasoning?: AiReasoning;

  @ApiPropertyOptional({
    description: 'Overrides predefined AI compass conversation prompt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  compassConversationOverride?: string;
}

export class SendCompassChatMessagePlaygroundPayloadDto extends SendCompassChatMessagePayloadDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SendCompassChatMessageDeveloperOptionsPlaygroundPayloadDto)
  developerOptions?: SendCompassChatMessageDeveloperOptionsPlaygroundPayloadDto;
}
