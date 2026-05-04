import { Injectable, Logger, Optional } from '@nestjs/common';
import { OpenAiService } from './open-ai';
import { AiProviders, AiReasoning, AiService } from './base';
import { AiFacade, AiGenerateFacadeParams } from './ai.facade';
import { AiGenerateData } from './base/models/ai-generate-data';
import { GeminiService } from './gemini';
import { AnthropicService } from './anthropic';
import { TokenUsageService } from '../domain/ai-usage/services/token-usage.service';

@Injectable()
export class AiRealFacade implements AiFacade {
  private readonly logger = new Logger(AiRealFacade.name);
  private readonly defaultProvider = AiProviders.Gemini;
  private readonly defaultModel = 'gemini-2.5-flash';
  private readonly defaultReasoning = AiReasoning.Low;

  constructor(
    private readonly openAi: OpenAiService,
    private readonly gemini: GeminiService,
    private readonly anthropic: AnthropicService,
    @Optional()
    private readonly tokenUsageService?: TokenUsageService,
  ) {}

  async generate(
    params: AiGenerateFacadeParams,
  ): Promise<AiGenerateData> {
    const provider = params.provider ?? this.defaultProvider;
    const model = params.model ?? this.defaultModel;
    const providerService = this.getProviderService(provider);

    const result = await providerService.generate({
      ...params,
      model,
      reasoning: params.reasoning ?? this.defaultReasoning,
    });

    // Fire-and-forget token usage logging — must never block the response path
    if (result.usage && params.tracking && this.tokenUsageService) {
      this.tokenUsageService
        .log({
          userId: params.tracking.userId,
          chatId: params.tracking.chatId,
          provider,
          model,
          feature: params.tracking.feature,
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          totalTokens: result.usage.totalTokens,
        })
        .catch((err) =>
          this.logger.error('Token usage logging failed', err),
        );
    }

    return result;
  }

  private getProviderService(provider: AiProviders): AiService {
    switch (provider) {
      case AiProviders.Gemini:
        return this.gemini;
      case AiProviders.OpenAi:
        return this.openAi;
      case AiProviders.Anthropic:
        return this.anthropic;
      default:
        throw new Error(`Unsupported provider ${provider}`);
    }
  }
}
