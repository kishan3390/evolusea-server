import { AiService } from '../../base';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigProvider } from '@config';
import { OpenAiRequestParamsMapperService } from './open-ai-request-params-mapper.service';
import { OpenAiResponseDataMapperService } from './open-ai-response-data-mapper.service';

@Injectable()
export class OpenAiService extends AiService {
  constructor(
    requestParamsMapper: OpenAiRequestParamsMapperService,
    responseDataMapper: OpenAiResponseDataMapperService,
    httpService: HttpService,
  ) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const apiKey = ConfigProvider.ai.openAiKey;

    super(apiUrl, apiKey, requestParamsMapper, responseDataMapper, httpService);
  }
}
