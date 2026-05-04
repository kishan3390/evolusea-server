import { Injectable, Logger, LoggerService } from '@nestjs/common';
import {
  AiResponseDataMapperService,
  AiGenerateData,
  AiGenerateResponseAction,
  AiGenerateResponseMessage,
} from '../../base';
import {
  GeminiResponseData,
  isGeminiResponseContentMessage,
  isGeminiResponseToolCallFunctionMessage,
} from '../models';

@Injectable()
export class GeminiResponseDataMapperService
  implements AiResponseDataMapperService
{
  private logger: LoggerService;

  constructor() {
    this.logger = new Logger(GeminiResponseDataMapperService.name);
  }

  map(data: GeminiResponseData): AiGenerateData {
    if (!data.choices.length) {
      throw new Error('Gemini returned no choices');
    }

    let actions: AiGenerateResponseAction[] = [];
    let message: AiGenerateResponseMessage | undefined;
    for (const choice of data.choices) {
      if (isGeminiResponseContentMessage(choice.message)) {
        message = {
          content: choice.message.content,
          role: choice.message.role,
        };
        continue;
      }

      if (isGeminiResponseToolCallFunctionMessage(choice.message)) {
        actions = choice.message.tool_calls.map((toolCall) => ({
          role: choice.message.role,
          type: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments),
        }));
        continue;
      }

      this.logger.error(`Unhandled choice: ${JSON.stringify(choice)}`);
    }

    return {
      message,
      actions,
      usage: data.usage
        ? {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
