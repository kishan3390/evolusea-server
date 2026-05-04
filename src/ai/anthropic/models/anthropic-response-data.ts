export interface AnthropicResponseData {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicResponseContentBlock[];
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export type AnthropicResponseContentBlock =
  | AnthropicResponseTextBlock
  | AnthropicResponseToolUseBlock;

export interface AnthropicResponseTextBlock {
  type: 'text';
  text: string;
}

export interface AnthropicResponseToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, any>;
}
