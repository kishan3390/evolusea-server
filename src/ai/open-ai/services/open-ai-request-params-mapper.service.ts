import { Injectable } from '@nestjs/common';
import {
  AiGenerateParamsTool,
  AiReasoning,
  AiRequestParamsMapperService,
  AiToolSelectionModes,
  AiToolTypes,
} from '../../base';
import { AiGenerateParams } from 'src/ai/base/models/ai-generate-params';
import {
  OpenAiRequestMessage,
  OpenAiRequestParams,
  OpenAiRequestTool,
  OpenAiRequestToolWebSearch,
} from '../models';
import { OpenAiReasoningEfforts, OpenAiToolChoicesEnum } from '../enums';

@Injectable()
export class OpenAiRequestParamsMapperService
  implements AiRequestParamsMapperService
{
  map(params: AiGenerateParams): OpenAiRequestParams {
    const mappedParams: OpenAiRequestParams = {
      model: params.model,
      input: params.messages.map(
        (message) =>
          ({
            role: message.role,
            content: message.content,
          }) satisfies OpenAiRequestMessage,
      ),
      tools: params.tools?.map((tool) => this.mapTool(tool)),
    };

    const reasoning = this.mapReasoning(params.reasoning);
    if (reasoning) {
      mappedParams.reasoning = {
        effort: reasoning,
      };
    }

    const toolChoice = this.mapToolChoice(params.toolSelectionMode);
    if (toolChoice) {
      mappedParams.tool_choice = toolChoice;
    }

    if (params.responseFormat) {
      mappedParams.text = {
        format: {
          type: params.responseFormat.type,
          schema: params.responseFormat.schema,
          name: params.responseFormat.name,
        }
      };
    }

    if (params.temperature) {
      mappedParams.temperature = params.temperature;
    }

    if (params.maxTokens) {
      mappedParams.max_output_tokens = params.maxTokens;
    }

    return mappedParams;
  }

  private mapTool(tool: AiGenerateParamsTool): OpenAiRequestTool {
    switch (tool.type) {
      case AiToolTypes.Function:
        return {
          type: tool.type,
          name: tool.function.name,
          parameters: tool.function.parameters,
          description: tool.function.description,
        } satisfies OpenAiRequestTool;
      case AiToolTypes.WebSearch: {
        const webSearch: OpenAiRequestToolWebSearch = {
          type: tool.type,
        };

        if (tool.userLocation) {
          webSearch.user_location = {
            type: tool.userLocation.type,
            country: tool.userLocation.country,
          };
        }
        return webSearch;
      }
    }
  }

  private mapToolChoice(
    selectionMode?: AiToolSelectionModes,
  ): OpenAiToolChoicesEnum | null {
    switch (selectionMode) {
      case AiToolSelectionModes.AnyCallRequired:
        return OpenAiToolChoicesEnum.Required;
      case AiToolSelectionModes.AllCallsOptional:
        return OpenAiToolChoicesEnum.Auto;
      default:
        return null;
    }
  }

  private mapReasoning(
    aiReasoning?: AiReasoning,
  ): OpenAiReasoningEfforts | null {
    switch (aiReasoning) {
      case AiReasoning.Default:
        return null;
      case AiReasoning.None:
        return OpenAiReasoningEfforts.Minimal;
      case AiReasoning.Low:
        return OpenAiReasoningEfforts.Low;
      case AiReasoning.Medium:
        return OpenAiReasoningEfforts.Medium;
      case AiReasoning.High:
        return OpenAiReasoningEfforts.High;
      default:
        return null;
    }
  }
}
