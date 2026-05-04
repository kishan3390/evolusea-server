import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { AchievementController } from './achievement.controller';

@Module({
  imports: [DomainModule],
  controllers: [AchievementController],
})
export class AchievementApiModule {}
