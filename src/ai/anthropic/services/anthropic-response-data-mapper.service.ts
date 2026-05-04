import { Injectable, Logger, LoggerService } from '@nestjs/common';
import {
  AiGenerateData,
  AiGenerateResponseMessage,
  AiResponseDataMapperService,
  AiRoleEnum,
} from '../../base';
import { AnthropicResponseData } from '../models';

@Injectable()
export class AnthropicResponseDataMapperService
  implements AiResponseDataMapperService
{
  private logger: LoggerService;

  constructor() {
    this.logger = new Logger(AnthropicResponseDataMapperService.name);
  }

  map(data: AnthropicResponseData): AiGenerateData {
    let message: AiGenerateResponseMessage | undefined;

    const textBlock = data.content.find((c) => c.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      message = {
        role: AiRoleEnum.Assistant,
        content: textBlock.text,
      };
    }

    if (!textBlock) {
      this.logger.warn('Anthropic returned no text content blocks');
    }

    return {
      message,
      actions: [],
      usage: data.usage
        ? {
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    };
  }
}
