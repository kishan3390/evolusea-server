import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AiRequestParamsMapperService } from './ai-request-params-mapper.service';
import { AiResponseDataMapperService } from './ai-response-data-mapper.service';
import { AiGenerateData, AiGenerateParams } from '../models';
import { AiHelper } from './ai-helper';

export abstract class AiService {
  protected constructor(
    protected readonly apiUrl: string,
    protected readonly apiKey: string,
    protected readonly requestMapper: AiRequestParamsMapperService,
    protected readonly responseMapper: AiResponseDataMapperService,
    protected readonly httpService: HttpService,
  ) {}

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async generate(params: AiGenerateParams): Promise<AiGenerateData> {
    const messages = AiHelper.mergeSequentialMessagesWithSameRole(
      params.messages,
    );
    const payload = this.requestMapper.map({ ...params, messages });
    const response$ = this.httpService.post(this.apiUrl, payload, {
      headers: this.getHeaders(),
    });
    const axiosResponse = await lastValueFrom(response$);
    return this.responseMapper.map(axiosResponse.data);
  }
}
