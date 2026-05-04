import { AiRoleEnum, AiToolTypes } from '../../base';
import { OpenAiReasoningEfforts, OpenAiToolChoicesEnum } from '../enums';

export interface OpenAiRequestParams {
  model: string;
  input: OpenAiRequestMessage[];
  reasoning?: OpenAiRequestReasoning;
  tools?: OpenAiRequestTool[];

  /**
   * https://platform.openai.com/docs/guides/function-calling#tool-choice
   */
  tool_choice?: OpenAiToolChoicesEnum | OpenAiRequestToolChoiceForcedFunction;
  text?: OpenAiRequestText;
  temperature?: number;
  max_output_tokens?: number;
}

export interface OpenAiRequestReasoning {
  effort: OpenAiReasoningEfforts;
}

export interface OpenAiRequestMessage {
  role: AiRoleEnum;
  content: string;
}

export type OpenAiRequestTool =
  | OpenAiRequestToolFunction
  | OpenAiRequestToolWebSearch;

export interface OpenAiRequestToolFunction {
  type: AiToolTypes.Function;
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface OpenAiRequestToolWebSearch {
  type: AiToolTypes.WebSearch;
  user_location?: {
    type: 'approximate';
    country: string;
    city?: string;
    region?: string;
  }
}

export interface OpenAiRequestToolChoiceForcedFunction {
  type: AiToolTypes.Function;
  name: string;
}

export interface OpenAiRequestText {
  format: OpenAiRequestTextFormat;
}

export interface OpenAiRequestTextFormat {
  type: 'json_schema',
  name: string;
  schema: Record<string, any>;
}