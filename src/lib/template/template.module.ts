import { DynamicModule, Module, Provider } from '@nestjs/common';

import { HandlebarsTemplateService } from './handlebars-template.service';
import { defaultTemplateHelpers } from './template-helpers';
import { TemplateService } from './template.service';

const TEMPLATE_HELPERS_INITIALIZER = Symbol('TEMPLATE_HELPERS_INITIALIZER');
const templateProviders: Provider[] = [
  HandlebarsTemplateService,
  {
    provide: TemplateService,
    useExisting: HandlebarsTemplateService,
  },
];

@Module({
  providers: templateProviders,
  exports: templateProviders,
})
export class TemplateModule {
  static forRoot(): DynamicModule {
    const helpersInitializer: Provider = {
      provide: TEMPLATE_HELPERS_INITIALIZER,
      inject: [TemplateService],
      useFactory: (templateService: TemplateService) => {
        defaultTemplateHelpers.forEach((helper) =>
          templateService.registerHelper(helper),
        );
      },
    };

    return {
      module: TemplateModule,
      providers: [helpersInitializer],
      exports: templateProviders,
    };
  }
}
