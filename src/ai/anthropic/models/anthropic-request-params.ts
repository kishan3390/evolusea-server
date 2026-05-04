export interface AnthropicRequestParams {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AnthropicRequestMessage[];
  temperature?: number;
}

export interface AnthropicRequestMessage {
  role: 'user' | 'assistant';
  content: string;
}
