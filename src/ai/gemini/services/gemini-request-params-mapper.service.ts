import { Injectable } from '@nestjs/common';
import {
  AiGenerateParamsTool,
  AiRequestParamsMapperService,
  AiToolSelectionModes,
  AiToolTypes,
} from '../../base';
import { AiGenerateParams } from 'src/ai/base/models/ai-generate-params';
import {
  GeminiRequestParams,
  GeminiRequestMessage,
  GeminiRequestTool,
} from '../models';
import { AiReasoning } from '../../base';
import {
  GeminiFunctionCallingModesEnum,
  GeminiReasoningEfforts,
} from '../enums';

@Injectable()
export class GeminiRequestParamsMapperService
  implements AiRequestParamsMapperService
{
  map(params: AiGenerateParams): GeminiRequestParams {
    const mappedParams: GeminiRequestParams = {
      model: params.model,
      messages: params.messages.map(
        (message) =>
          ({
            role: message.role,
            content: message.content,
          }) satisfies GeminiRequestMessage,
      ),
      tools: params.tools?.map((tool) => this.mapTool(tool)),
    };

    const reasoning = this.mapReasoning(params.reasoning);
    if (reasoning) {
      mappedParams.reasoning_effort = reasoning;
    }

    const toolChoice = this.mapToolChoice(params.toolSelectionMode);
    if (toolChoice) {
      mappedParams.tool_choice = toolChoice;
    }

    if (params.temperature) {
      mappedParams.temperature = params.temperature;
    }

    if (params.maxTokens) {
      mappedParams.max_tokens = params.maxTokens;
    }

    return mappedParams;
  }

  private mapTool(tool: AiGenerateParamsTool): GeminiRequestTool {
    switch (tool.type) {
      case AiToolTypes.Function:
        return {
          type: tool.type,
          function: {
            name: tool.function.name,
            parameters: tool.function.parameters,
            description: tool.function.description,
          },
        };
      default:
        throw new Error('Not implemented');
    }
  }

  private mapToolChoice(
    selectionMode?: AiToolSelectionModes,
  ): GeminiFunctionCallingModesEnum | null {
    switch (selectionMode) {
      case AiToolSelectionModes.AnyCallRequired:
        return GeminiFunctionCallingModesEnum.Required;
      case AiToolSelectionModes.AllCallsOptional:
        return GeminiFunctionCallingModesEnum.Auto;
      default:
        return null;
    }
  }

  private mapReasoning(
    aiReasoning?: AiReasoning,
  ): GeminiReasoningEfforts | null {
    switch (aiReasoning) {
      case AiReasoning.Default:
        return null;
      case AiReasoning.None:
        return GeminiReasoningEfforts.None;
      case AiReasoning.Low:
        return GeminiReasoningEfforts.Low;
      case AiReasoning.Medium:
        return GeminiReasoningEfforts.Medium;
      case AiReasoning.High:
        return GeminiReasoningEfforts.High;
      default:
        return null;
    }
  }
}
