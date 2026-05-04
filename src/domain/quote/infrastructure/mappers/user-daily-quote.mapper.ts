import { DomainMapper } from '@building-blocks/infrastructure';
import { UserDailyQuote } from '../../domain';
import { UserDailyQuoteEntity } from '../entities';
import { QuotePoolMapper } from './quote-pool.mapper';

export class UserDailyQuoteMapper
  implements DomainMapper<UserDailyQuote, UserDailyQuoteEntity>
{
  private readonly quotePoolMapper = new QuotePoolMapper();

  toDomain(entity: UserDailyQuoteEntity): UserDailyQuote {
    return new UserDailyQuote({
      id: entity.id,
      userProfileId: entity.userProfileId,
      quotePoolId: entity.quotePoolId,
      date: entity.date,
      orderIndex: entity.orderIndex,
      createdAt: entity.createdAt,
      quotePoolItem: entity.quotePool
        ? this.quotePoolMapper.toDomain(entity.quotePool)
        : undefined,
    });
  }
}
