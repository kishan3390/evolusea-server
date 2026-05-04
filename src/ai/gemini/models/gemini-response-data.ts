import { AiRoleEnum } from '../../base';
import { AiToolTypes } from '../../base';

export interface GeminiResponseData {
  choices: GeminiResponseChoice[];
  created: number;
  id: string;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface GeminiResponseChoice {
  finish_reason: 'stop' | 'tool_calls';
  index: number;
  message: GeminiResponseContentMessage | GeminiResponseToolCallFunctionMessage;
}

export function isGeminiResponseContentMessage(
  value: GeminiResponseContentMessage | GeminiResponseToolCallFunctionMessage,
): value is GeminiResponseContentMessage {
  return 'content' in value;
}

export interface GeminiResponseContentMessage {
  role: AiRoleEnum;
  content: string;
}

export function isGeminiResponseToolCallFunctionMessage(
  value: GeminiResponseContentMessage | GeminiResponseToolCallFunctionMessage,
): value is GeminiResponseToolCallFunctionMessage {
  return 'tool_calls' in value;
}

export interface GeminiResponseToolCallFunctionMessage {
  role: AiRoleEnum;
  tool_calls: GeminiResponseToolCall[];
}

export interface GeminiResponseToolCall {
  id: string;
  type: AiToolTypes.Function;
  function: {
    name: string;
    arguments: string;
  };
}
