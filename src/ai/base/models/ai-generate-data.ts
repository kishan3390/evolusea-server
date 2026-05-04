import { AiRoleEnum } from '../enums';

export interface AiGenerateData {
  message?: AiGenerateResponseMessage;
  actions: AiGenerateResponseAction[];
  usage?: AiGenerateResponseUsage;
}

export interface AiGenerateResponseUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiGenerateResponseMessage {
  role: AiRoleEnum;
  content: string;
}

export interface AiGenerateResponseAction {
  type: string;
  args: Record<string, any>;
}
