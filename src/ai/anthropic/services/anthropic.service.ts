import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigProvider } from '@config';
import { AiService } from '../../base';
import { AnthropicRequestParamsMapperService } from './anthropic-request-params-mapper.service';
import { AnthropicResponseDataMapperService } from './anthropic-response-data-mapper.service';

@Injectable()
export class AnthropicService extends AiService {
  constructor(
    requestParamsMapper: AnthropicRequestParamsMapperService,
    responseDataMapper: AnthropicResponseDataMapperService,
    httpService: HttpService,
  ) {
    const apiUrl = 'https://api.anthropic.com/v1/messages';
    const apiKey = ConfigProvider.ai.anthropicKey;

    super(apiUrl, apiKey, requestParamsMapper, responseDataMapper, httpService);
  }

  protected override getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }
}
