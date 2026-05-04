import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDailyQuote, UserDailyQuoteRepository } from '../../domain';
import { UserDailyQuoteEntity } from '../entities';
import { UserDailyQuoteMapper } from '../mappers/user-daily-quote.mapper';

@Injectable()
export class PostgresUserDailyQuoteRepository
  implements UserDailyQuoteRepository
{
  private readonly mapper = new UserDailyQuoteMapper();

  constructor(
    @InjectRepository(UserDailyQuoteEntity)
    private readonly repository: Repository<UserDailyQuoteEntity>,
  ) {}

  async findByUserAndDate(
    userProfileId: string,
    date: string,
  ): Promise<UserDailyQuote[]> {
    const entities = await this.repository.find({
      where: { userProfileId, date },
      order: { orderIndex: 'ASC' },
      relations: ['quotePool'],
    });

    return entities.map((e) => this.mapper.toDomain(e));
  }

  async createBatch(selections: UserDailyQuote[]): Promise<void> {
    const entities = selections.map((selection) => {
      const entity = new UserDailyQuoteEntity();
      entity.id = selection.getId();
      entity.userProfileId = selection.getUserProfileId();
      entity.quotePoolId = selection.getQuotePoolId();
      entity.date = selection.getDate();
      entity.orderIndex = selection.getOrderIndex();
      entity.createdAt = selection.getCreatedAt();
      return entity;
    });

    await this.repository.save(entities);
  }
}
