import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyEngagementRepository } from '../../domain';
import { DailyEngagement } from '../../domain/daily-engagement';
import { DailyEngagementEntity } from '../entities';
import { DailyEngagementMapper } from '../mappers/daily-engagement.mapper';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';

@Injectable()
export class PostgresDailyEngagementRepository
  implements DailyEngagementRepository
{
  private readonly mapper = new DailyEngagementMapper();

  constructor(
    @InjectRepository(DailyEngagementEntity)
    private readonly repository: Repository<DailyEngagementEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async upsert(entity: DailyEngagement, tx?: Transaction): Promise<void> {
    const mapped = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx
        .getRepository(DailyEngagementEntity)
        .upsert(mapped, {
          conflictPaths: ['userProfileId', 'date'],
          skipUpdateIfNoValuesChanged: true,
        });
    }, tx);
  }

  async findAllDatesByUserProfileId(
    userProfileId: string,
  ): Promise<string[]> {
    const results = await this.repository.find({
      where: { userProfileId },
      select: ['date'],
      order: { date: 'ASC' },
    });
    return results.map((r) => r.date);
  }
}
