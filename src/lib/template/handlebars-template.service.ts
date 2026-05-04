import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';

import { TemplateHelper } from './template-helpers';
import { TemplateDelegate, TemplateService } from './template.service';

@Injectable()
export class HandlebarsTemplateService extends TemplateService {
  compileTemplate<TContext = unknown>(
    template: string,
  ): TemplateDelegate<TContext> {
    return Handlebars.compile(template);
  }

  registerHelper(helper: TemplateHelper): void {
    Handlebars.registerHelper(helper.name, helper.body);
  }
}
