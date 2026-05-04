import { TemplateHelper } from './template-helpers';

export interface TemplateDelegate<T = any> {
  (templateParams: T): string;
}

export abstract class TemplateService {
  abstract compileTemplate<TContext = unknown>(
    template: string,
  ): TemplateDelegate<TContext>;

  abstract registerHelper(helper: TemplateHelper): void;
}
