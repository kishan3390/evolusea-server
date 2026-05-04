import { Injectable, Logger } from '@nestjs/common';
import { AiTokenUsageRepository } from '../domain/repositories/ai-token-usage.repository';
import { AiTokenUsageCreateArgs } from '../domain/ai-token-usage';

/**
 * Cost per token in USD, by model name.
 * Update as pricing changes.
 */
const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.00000015, output: 0.0000006 },
  'gemini-2.0-flash': { input: 0.0000001, output: 0.0000004 },
  'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
  'gpt-5': { input: 0.00000015, output: 0.0000006 },
  'claude-sonnet-4-20250514': { input: 0.000003, output: 0.000015 },
};

const DEFAULT_COST = { input: 0.00000015, output: 0.0000006 };

/** Daily token budgets per subscription tier */
export const DAILY_TOKEN_BUDGET: Record<string, number> = {
  free: 5_000,
  standard: 50_000,
  premium: 200_000,
};

export interface LogTokenUsageArgs {
  userId: string;
  chatId?: string | null;
  provider: string;
  model: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

@Injectable()
export class TokenUsageService {
  private readonly logger = new Logger(TokenUsageService.name);

  constructor(
    private readonly tokenUsageRepository: AiTokenUsageRepository,
  ) {}

  /**
   * Log token usage asynchronously. Call with .catch() — must never block response path.
   */
  async log(args: LogTokenUsageArgs): Promise<void> {
    const estimatedCostUsd = this.calculateCost(args.model, {
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
    });

    const createArgs: AiTokenUsageCreateArgs = {
      userId: args.userId,
      chatId: args.chatId ?? null,
      provider: args.provider,
      model: args.model,
      feature: args.feature,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      totalTokens: args.totalTokens,
      estimatedCostUsd,
    };

    await this.tokenUsageRepository.create(createArgs);
  }

  /**
   * Check if a user still has token budget for today.
   */
  async hasTokenBudget(
    userId: string,
    tier: string,
  ): Promise<boolean> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayUsage =
      await this.tokenUsageRepository.getDailyTotalTokens(userId, todayStart);
    const budget = DAILY_TOKEN_BUDGET[tier] ?? DAILY_TOKEN_BUDGET.free;

    return todayUsage < budget;
  }

  /**
   * Calculate estimated cost in USD for a given model and token usage.
   */
  calculateCost(
    model: string,
    usage: { inputTokens: number; outputTokens: number },
  ): number {
    const rates = COST_PER_TOKEN[model] ?? DEFAULT_COST;
    return (
      usage.inputTokens * rates.input + usage.outputTokens * rates.output
    );
  }
}
