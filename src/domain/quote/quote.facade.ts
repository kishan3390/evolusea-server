import {
  GetDailyQuotesQuery,
  GetQuoteByIdQuery,
  ListQuotePoolQuery,
} from '@domain/quote/application';
import { QuotePoolItem } from '@domain/quote/domain';
import { PaginatedList } from '@building-blocks/application';
import {
  GetQuotesQuotaQuery,
  GetQuotesQuotaQueryResult,
} from '@domain/quote/application/queries/get-quotes-quota';

export abstract class QuoteFacade {
  abstract getDailyQuotes(
    query: GetDailyQuotesQuery,
  ): Promise<QuotePoolItem[]>;

  abstract getQuoteById(
    query: GetQuoteByIdQuery,
  ): Promise<QuotePoolItem | null>;

  abstract listQuotePool(
    query: ListQuotePoolQuery,
  ): Promise<PaginatedList<QuotePoolItem>>;

  abstract getQuotesQuota(
    query: GetQuotesQuotaQuery,
  ): Promise<GetQuotesQuotaQueryResult>;
}
