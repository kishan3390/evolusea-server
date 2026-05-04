import { AiGenerateParams } from '../models';

export abstract class AiRequestParamsMapperService {
  abstract map(request: AiGenerateParams): any;
}
