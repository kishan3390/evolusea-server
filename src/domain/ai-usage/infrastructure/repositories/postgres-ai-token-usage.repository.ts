import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiTokenUsageRepository } from '../../domain/repositories/ai-token-usage.repository';
import { AiTokenUsageEntity } from '../entities/ai-token-usage.entity';
import { AiTokenUsageCreateArgs } from '../../domain/ai-token-usage';

@Injectable()
export class PostgresAiTokenUsageRepository
  implements AiTokenUsageRepository
{
  constructor(
    @InjectRepository(AiTokenUsageEntity)
    private readonly repo: Repository<AiTokenUsageEntity>,
  ) {}

  async create(args: AiTokenUsageCreateArgs): Promise<void> {
    const entity = this.repo.create({
      userId: args.userId,
      chatId: args.chatId ?? null,
      provider: args.provider,
      model: args.model,
      feature: args.feature,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      totalTokens: args.totalTokens,
      estimatedCostUsd: args.estimatedCostUsd,
    });
    await this.repo.save(entity);
  }

  async getDailyTotalTokens(
    userId: string,
    todayStart: Date,
  ): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('u')
      .select('COALESCE(SUM(u.totalTokens), 0)', 'total')
      .where('u.userId = :userId AND u.createdAt >= :todayStart', {
        userId,
        todayStart,
      })
      .getRawOne();

    return Number(result?.total ?? 0);
  }
}
