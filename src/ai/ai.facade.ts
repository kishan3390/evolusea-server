import { AiProviders, AiGenerateData, AiGenerateParams } from './base';

export interface AiGenerateFacadeParams
  extends Omit<AiGenerateParams, 'model'> {
  model?: string;
  provider?: AiProviders;

  /** Optional tracking metadata — used for token usage logging */
  tracking?: {
    userId: string;
    chatId?: string | null;
    feature: string;
  };
}

export abstract class AiFacade {
  abstract generate(params: AiGenerateFacadeParams): Promise<AiGenerateData>;
}
