import { Injectable, Logger, LoggerService } from '@nestjs/common';
import {
  AiGenerateData,
  AiGenerateResponseAction,
  AiGenerateResponseMessage,
  AiResponseDataMapperService,
} from '../../base';
import { OpenAiResponseData, OpenAiResponseOutputMessage } from '../models';
import { OpenAiResponseOutputs } from '../enums/open-ai-response-outputs.enum';

@Injectable()
export class OpenAiResponseDataMapperService
  implements AiResponseDataMapperService
{
  private logger: LoggerService;

  constructor() {
    this.logger = new Logger(OpenAiResponseDataMapperService.name);
  }

  map(data: OpenAiResponseData): AiGenerateData {
    const actions: AiGenerateResponseAction[] = [];
    let message: AiGenerateResponseMessage | undefined;
    for (const output of data.output) {
      switch (output.type) {
        case OpenAiResponseOutputs.Message: {
          message = this.mapOutputMessage(output);
          break;
        }
        case OpenAiResponseOutputs.FunctionCall: {
          actions.push({
            type: output.name,
            args: JSON.parse(output.arguments),
          });
          break;
        }
        case OpenAiResponseOutputs.Reasoning:
          break;
        case OpenAiResponseOutputs.WebSearchCall:
          break;
        default: {
          // @ts-expect-error: handle a case with an unregistered output type
          this.logger.error(`Unhandled output type: ${output.type}`);
          break;
        }
      }
    }
    return {
      message,
      actions,
      usage: data.usage
        ? {
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  private mapOutputMessage(
    messageOutput: OpenAiResponseOutputMessage,
  ): AiGenerateResponseMessage | undefined {
    if (!messageOutput.content.length) {
      throw new Error('OpenAi returned no contents');
    }

    if (messageOutput.content.length > 1) {
      this.logger.warn('OpenAi returned multiple contents, using first one');
    }

    return {
      role: messageOutput.role,
      content: messageOutput.content[0].text,
    };
  }
}
