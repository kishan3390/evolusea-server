import { Injectable } from '@nestjs/common';
import {
  GetDailyQuotesQuery,
  GetDailyQuotesQueryHandler,
  GetQuoteByIdQuery,
  GetQuoteByIdQueryHandler,
  ListQuotePoolQuery,
  ListQuotePoolQueryHandler,
} from '@domain/quote/application';
import { QuotePoolItem } from '@domain/quote/domain';
import { PaginatedList } from '@building-blocks/application';
import {
  GetQuotesQuotaQuery,
  GetQuotesQuotaQueryHandler,
  GetQuotesQuotaQueryResult,
} from '@domain/quote/application/queries/get-quotes-quota';
import { QuoteFacade } from '@domain/quote/quote.facade';

@Injectable()
export class QuoteRealFacade extends QuoteFacade {
  constructor(
    private readonly getDailyQuotesQueryHandler: GetDailyQuotesQueryHandler,
    private readonly getQuoteByIdQueryHandler: GetQuoteByIdQueryHandler,
    private readonly listQuotePoolQueryHandler: ListQuotePoolQueryHandler,
    private readonly getQuotesQuotaHandler: GetQuotesQuotaQueryHandler,
  ) {
    super();
  }

  async getDailyQuotes(
    query: GetDailyQuotesQuery,
  ): Promise<QuotePoolItem[]> {
    return this.getDailyQuotesQueryHandler.handle(query);
  }

  async getQuoteById(
    query: GetQuoteByIdQuery,
  ): Promise<QuotePoolItem | null> {
    return this.getQuoteByIdQueryHandler.handle(query);
  }

  async listQuotePool(
    query: ListQuotePoolQuery,
  ): Promise<PaginatedList<QuotePoolItem>> {
    return this.listQuotePoolQueryHandler.handle(query);
  }

  async getQuotesQuota(
    query: GetQuotesQuotaQuery,
  ): Promise<GetQuotesQuotaQueryResult> {
    return this.getQuotesQuotaHandler.handle(query);
  }
}
