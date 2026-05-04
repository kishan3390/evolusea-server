import { AiReasoning, AiRoleEnum, AiToolSelectionModes } from '../enums';
import { AiToolTypes } from '../enums';

export interface AiGenerateParams {
  model: string;
  temperature?: number;
  reasoning?: AiReasoning;
  messages: AiGenerateParamsMessage[];
  tools?: AiGenerateParamsTool[];

  /**
   * Defaults to AiToolChoices.Optional
   */
  toolSelectionMode?: AiToolSelectionModes;
  responseFormat?: AiGenerateParamsResponseFormat;

  /**
   * Maximum number of tokens the model should generate in the response.
   * Maps to provider-specific fields (max_tokens for Gemini/Anthropic, max_output_tokens for OpenAI).
   */
  maxTokens?: number;
}

export interface AiGenerateParamsMessage {
  role: AiRoleEnum;
  content: string;
}

export type AiGenerateParamsTool =
  | AiGenerateParamsToolFunction
  | AiGenerateParamsToolWebSearch;

export interface AiGenerateParamsToolFunction {
  type: AiToolTypes.Function;
  function: {
    name: string;
    description: string;
    parameters?: Record<string, any>;
  };
}

export interface AiGenerateParamsToolWebSearch {
  type: AiToolTypes.WebSearch;
  userLocation?: {
    type: 'approximate';
    country: string;
  };
}

export interface AiGenerateParamsResponseFormat {
  type: 'json_schema';
  name: string;
  schema: Record<string, any>
}