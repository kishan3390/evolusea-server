export interface AiTokenUsageProps {
  id: string;
  userId: string;
  chatId: string | null;
  provider: string;
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  createdAt: Date;
}

export interface AiTokenUsageCreateArgs {
  userId: string;
  chatId?: string | null;
  provider: string;
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}
