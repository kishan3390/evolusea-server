import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiTokenUsageEntity } from './infrastructure/entities/ai-token-usage.entity';
import { AiTokenUsageRepository } from './domain/repositories/ai-token-usage.repository';
import { PostgresAiTokenUsageRepository } from './infrastructure/repositories/postgres-ai-token-usage.repository';
import { TokenUsageService } from './services/token-usage.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiTokenUsageEntity])],
  providers: [
    {
      provide: AiTokenUsageRepository,
      useClass: PostgresAiTokenUsageRepository,
    },
    TokenUsageService,
  ],
  exports: [TokenUsageService],
})
export class AiUsageModule {}
