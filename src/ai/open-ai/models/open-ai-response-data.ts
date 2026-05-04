import { AiRoleEnum } from '../../base';
import { OpenAiResponseOutputs } from '../enums/open-ai-response-outputs.enum';

export interface OpenAiResponseData {
  /**
   * For a single response OpenAI may return multiple outputs of different types
   * e.g., message or function_call
   */
  output: OpenAiResponseOutput[];
  usage: {
    input_tokens: number;
    input_tokens_details?: {
      cached_tokens?: number | null;
    };
    output_tokens: number;
    output_tokens_details?: {
      reasoning_tokens?: number | null;
    };
    total_tokens: number;
  };
}

export type OpenAiResponseOutput =
  | OpenAiResponseOutputMessage
  | OpenAiResponseOutputFunctionCall
  | OpenAiResponseOutputReasoning
  | OpenAiResponseOutputWebSearchCall;

export interface OpenAiResponseOutputMessage {
  id: string;
  type: OpenAiResponseOutputs.Message;
  status: 'completed';
  role: AiRoleEnum;

  /**
   * For a single response OpenAI may return multiple contents of different types
   * e.g., output_text or output_image
   */
  content: OpenAiResponseContent[];
}

export interface OpenAiResponseOutputFunctionCall {
  id: string;
  type: OpenAiResponseOutputs.FunctionCall;
  status: 'completed';
  arguments: string;
  call_id: string;
  name: string;
}

export interface OpenAiResponseOutputReasoning {
  type: OpenAiResponseOutputs.Reasoning;
}

export interface OpenAiResponseOutputWebSearchCall {
  type: OpenAiResponseOutputs.WebSearchCall;
}

export interface OpenAiResponseContent {
  type: 'output_text';
  text: string;
  annotations?: unknown[];
  logprobs: string[];
}
