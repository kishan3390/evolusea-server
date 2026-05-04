import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenUsageService, type LogTokenUsageArgs } from './token-usage.service';

describe('TokenUsageService', () => {
  let repository: { create: ReturnType<typeof vi.fn>; getDailyTotalTokens: ReturnType<typeof vi.fn> };
  let service: TokenUsageService;

  beforeEach(() => {
    repository = {
      create: vi.fn().mockResolvedValue(undefined),
      getDailyTotalTokens: vi.fn().mockResolvedValue(0),
    };
    service = new TokenUsageService(repository);
  });

  describe('hasTokenBudget', () => {
    it('returns true when usage is below free tier budget', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(1_000);
      const result = await service.hasTokenBudget('user-1', 'free');
      expect(result).toBe(true);
      expect(repository.getDailyTotalTokens).toHaveBeenCalledWith(
        'user-1',
        expect.any(Date),
      );
    });

    it('returns false when usage equals or exceeds free tier budget', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(5_000);
      const result = await service.hasTokenBudget('user-1', 'free');
      expect(result).toBe(false);
    });

    it('returns false when usage exceeds free tier budget', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(6_000);
      const result = await service.hasTokenBudget('user-1', 'free');
      expect(result).toBe(false);
    });

    it('uses standard tier budget when tier is standard', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(40_000);
      const result = await service.hasTokenBudget('user-1', 'standard');
      expect(result).toBe(true);
    });

    it('uses free tier budget for unknown tier', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(5_000);
      const result = await service.hasTokenBudget('user-1', 'unknown');
      expect(result).toBe(false);
    });
  });

  describe('log', () => {
    it('calls repository.create with correct args including estimated cost', async () => {
      const args: LogTokenUsageArgs = {
        userId: 'user-1',
        chatId: 'chat-1',
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        feature: 'compass',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      };

      await service.log(args);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          chatId: 'chat-1',
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          feature: 'compass',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
          estimatedCostUsd: expect.any(Number),
        }),
      );
    });

    it('passes null for chatId when not provided', async () => {
      const args: LogTokenUsageArgs = {
        userId: 'user-1',
        chatId: null,
        provider: 'openai',
        model: 'gpt-4o-mini',
        feature: 'compass',
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      };

      await service.log(args);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ chatId: null }),
      );
    });
  });

  describe('calculateCost', () => {
    it('calculates cost for claude-sonnet-4-20250514', () => {
      const cost = service.calculateCost('claude-sonnet-4-20250514', {
        inputTokens: 1000,
        outputTokens: 500,
      });
      expect(cost).toBeCloseTo(0.000003 * 1000 + 0.000015 * 500, 10);
      expect(cost).toBeCloseTo(0.0105, 4);
    });

    it('calculates cost for gemini-2.5-flash', () => {
      const cost = service.calculateCost('gemini-2.5-flash', {
        inputTokens: 1000,
        outputTokens: 500,
      });
      expect(cost).toBeCloseTo(0.00000015 * 1000 + 0.0000006 * 500, 10);
      expect(cost).toBeCloseTo(0.00045, 6);
    });

    it('uses default cost for unknown model', () => {
      const cost = service.calculateCost('unknown-model', {
        inputTokens: 100,
        outputTokens: 50,
      });
      expect(cost).toBeCloseTo(0.00000015 * 100 + 0.0000006 * 50, 8);
    });

    it('returns zero when no tokens used', () => {
      const cost = service.calculateCost('gpt-4o-mini', {
        inputTokens: 0,
        outputTokens: 0,
      });
      expect(cost).toBe(0);
    });
  });
});
