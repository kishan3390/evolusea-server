import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AiProviders } from '../../../ai';
import { AiReasoning } from '../../../ai';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StartCompassChatPayloadDto } from './start-compass-chat.dto';
import { Type } from 'class-transformer';

export class CreateCompassChatDeveloperOptionsPlaygroundPayloadDto {
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
    description: 'Overrides predefined AI compass context prompt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  compassContextPromptOverride?: string;

  @ApiPropertyOptional({
    description: 'Overrides predefined AI welcome message prompt',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  compassWelcomePromptOverride?: string;
}

export class StartCompassChatPlaygroundPayloadDto extends StartCompassChatPayloadDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCompassChatDeveloperOptionsPlaygroundPayloadDto)
  developerOptions?: CreateCompassChatDeveloperOptionsPlaygroundPayloadDto;
}
