import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { MoodCheckinController } from './mood-checkin.controller';

@Module({
  imports: [DomainModule],
  controllers: [MoodCheckinController],
})
export class MoodCheckinApiModule {}
