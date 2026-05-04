import { PaginatedList, Pagination } from '@building-blocks/application';
import { QuotePoolItem } from '../quote-pool-item';
import { QuotePoolMoods } from '../enums/quote-pool-moods.enum';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';

export interface QuotePoolFilters {
  mood?: QuotePoolMoods;
  beliefSystem?: BeliefSystems;
  language?: Languages;
}

export abstract class QuotePoolRepository {
  abstract findOneById(id: string): Promise<QuotePoolItem | null>;

  abstract findRandomByFilter(
    beliefSystems: BeliefSystems[],
    mood: QuotePoolMoods,
    language: Languages,
    limit: number,
    excludeIds: string[],
  ): Promise<QuotePoolItem[]>;

  abstract list(
    pagination: Pagination,
    filters?: QuotePoolFilters,
  ): Promise<PaginatedList<QuotePoolItem>>;

  abstract count(filters?: QuotePoolFilters): Promise<number>;
}
