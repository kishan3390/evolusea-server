import { AiRoleEnum, AiToolTypes } from '../../base';
import {
  GeminiFunctionCallingModesEnum,
  GeminiReasoningEfforts,
} from '../enums';

export interface GeminiRequestParams {
  model: string;
  reasoning_effort?: GeminiReasoningEfforts;
  messages: GeminiRequestMessage[];
  tools?: GeminiRequestTool[];

  /**
   * Gemini modes are described under following link
   * https://ai.google.dev/gemini-api/docs/function-calling?example=chart#function_calling_modes
   * but in the current flow we use OpenAI compatible API which uses the OpenAI enum
   */
  tool_choice?: GeminiFunctionCallingModesEnum;
  temperature?: number;
  max_tokens?: number;
}

export interface GeminiRequestMessage {
  role: AiRoleEnum;
  content: string;
}

export interface GeminiRequestTool {
  type: AiToolTypes;
  function: GeminiRequestToolFunction;
}

export interface GeminiRequestToolFunction {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}
