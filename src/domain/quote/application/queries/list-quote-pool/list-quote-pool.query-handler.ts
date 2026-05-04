import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { ListQuotePoolQuery } from './list-quote-pool.query';
import { QuotePoolItem, QuotePoolRepository } from '@domain/quote/domain';

@Injectable()
export class ListQuotePoolQueryHandler
  implements QueryHandler<ListQuotePoolQuery, PaginatedList<QuotePoolItem>>
{
  constructor(private readonly quotePoolRepository: QuotePoolRepository) {}

  async handle(
    query: ListQuotePoolQuery,
  ): Promise<PaginatedList<QuotePoolItem>> {
    return this.quotePoolRepository.list(query.pagination, {
      mood: query.mood,
      beliefSystem: query.beliefSystem,
    });
  }
}
