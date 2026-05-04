import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
  OpenAiRequestParamsMapperService,
  OpenAiResponseDataMapperService,
  OpenAiService,
} from './open-ai';
import { AiRealFacade } from './ai-real.facade';
import { AiFacade } from './ai.facade';
import { GeminiService } from './gemini';
import {
  GeminiRequestParamsMapperService,
  GeminiResponseDataMapperService,
} from './gemini';
import {
  AnthropicService,
  AnthropicRequestParamsMapperService,
  AnthropicResponseDataMapperService,
} from './anthropic';
import { AiUsageModule } from '../domain/ai-usage/ai-usage.module';

@Module({
  imports: [HttpModule, AiUsageModule],
  providers: [
    GeminiService,
    OpenAiService,
    AnthropicService,
    {
      provide: AiFacade,
      useClass: AiRealFacade,
    },
    GeminiRequestParamsMapperService,
    GeminiResponseDataMapperService,
    OpenAiRequestParamsMapperService,
    OpenAiResponseDataMapperService,
    AnthropicRequestParamsMapperService,
    AnthropicResponseDataMapperService,
  ],
  exports: [AiFacade],
})
export class AiModule {}
