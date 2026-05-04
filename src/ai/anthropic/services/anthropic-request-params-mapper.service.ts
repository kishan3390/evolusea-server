import { Injectable } from '@nestjs/common';
import { AiRequestParamsMapperService, AiRoleEnum } from '../../base';
import { AiGenerateParams } from '../../base/models/ai-generate-params';
import { AnthropicRequestParams } from '../models';

@Injectable()
export class AnthropicRequestParamsMapperService
  implements AiRequestParamsMapperService
{
  map(params: AiGenerateParams): AnthropicRequestParams {
    const systemMessages = params.messages.filter(
      (m) => m.role === AiRoleEnum.System,
    );
    const nonSystemMessages = params.messages.filter(
      (m) => m.role !== AiRoleEnum.System,
    );

    const mappedParams: AnthropicRequestParams = {
      model: params.model,
      max_tokens: params.maxTokens ?? 4096,
      messages: nonSystemMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    };

    if (systemMessages.length > 0) {
      mappedParams.system = systemMessages
        .map((m) => m.content)
        .join('\n\n');
    }

    if (params.temperature !== undefined) {
      mappedParams.temperature = params.temperature;
    }

    return mappedParams;
  }
}
