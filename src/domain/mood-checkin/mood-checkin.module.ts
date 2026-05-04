import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodCheckinEntity } from './infrastructure/entities';
import { MoodCheckinRepository } from './domain';
import { PostgresMoodCheckinRepository } from './infrastructure/repositories/postgres-mood-checkin.repository';
import { MoodCheckinFacade } from './mood-checkin.facade';
import {
  CreateMoodCheckinCommandHandler,
  GetLatestMoodCheckinQueryHandler,
  ListMoodCheckinsQueryHandler,
} from './application';
import { EventEmitterModule } from '../../event-emitter/event-emitter.module';

@Module({
  imports: [TypeOrmModule.forFeature([MoodCheckinEntity]), EventEmitterModule],
  providers: [
    {
      provide: MoodCheckinRepository,
      useClass: PostgresMoodCheckinRepository,
    },
    CreateMoodCheckinCommandHandler,
    GetLatestMoodCheckinQueryHandler,
    ListMoodCheckinsQueryHandler,
    MoodCheckinFacade,
  ],
  exports: [MoodCheckinFacade],
})
export class MoodCheckinModule {}
