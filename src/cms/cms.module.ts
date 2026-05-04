import { Logger, Module } from '@nestjs/common';
import { CmsApi } from './cms-api';
import { StrapiCmsApi } from './strapi';

@Module({
  providers: [
    {
      provide: CmsApi,
      useClass: StrapiCmsApi,
    },
    Logger,
  ],
  exports: [CmsApi],
})
export class CmsModule {}
