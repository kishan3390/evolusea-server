import { Module } from '@nestjs/common';
import { MediatorModule } from '@building-blocks/infrastructure';

import { TemplateModule } from './lib/template/template.module';
import { HttpAppModule } from './http-app/http-app.module';
import { TypeOrmPostgresDatabaseModule } from './postgres';
import { EventEmitterModule } from './event-emitter/event-emitter.module';
import { AiModule } from './ai';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@config/config.module';

@Module({
  imports: [
    TypeOrmPostgresDatabaseModule.forRoot(),
    MediatorModule.forRoot(),
    TemplateModule.forRoot(),
    ScheduleModule.forRoot(),
    HttpAppModule,
    AiModule,
    EventEmitterModule,
    ConfigModule,
  ],
})
export class AppModule {}
