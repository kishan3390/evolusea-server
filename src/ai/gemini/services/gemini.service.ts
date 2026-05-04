import { ConfigProvider } from '@config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AiService } from '../../base';
import { GeminiRequestParamsMapperService } from './gemini-request-params-mapper.service';
import { GeminiResponseDataMapperService } from './gemini-response-data-mapper.service';

@Injectable()
export class GeminiService extends AiService {
  constructor(
    requestParamsMapper: GeminiRequestParamsMapperService,
    responseDataMapper: GeminiResponseDataMapperService,
    httpService: HttpService,
  ) {
    const apiUrl =
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    const apiKey = ConfigProvider.ai.geminiKey;

    super(apiUrl, apiKey, requestParamsMapper, responseDataMapper, httpService);
  }
}
