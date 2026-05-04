import { AiGenerateData } from '../models';

export abstract class AiResponseDataMapperService {
  abstract map(response: any): AiGenerateData;
}
