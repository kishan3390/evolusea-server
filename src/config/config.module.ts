import { Global, Module } from '@nestjs/common';
import { ConfigProvider, IConfig } from '.';

@Global()
@Module({
  providers: [
    {
      provide: IConfig,
      useValue: ConfigProvider,
    },
  ],
  exports: [IConfig],
})
export class ConfigModule {}
