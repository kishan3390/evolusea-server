import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetQuoteByIdQuery } from './get-quote-by-id.query';
import { QuotePoolItem, QuotePoolRepository } from '@domain/quote/domain';

@Injectable()
export class GetQuoteByIdQueryHandler
  implements QueryHandler<GetQuoteByIdQuery, QuotePoolItem>
{
  constructor(private readonly quotePoolRepository: QuotePoolRepository) {}

  async handle(query: GetQuoteByIdQuery): Promise<QuotePoolItem | null> {
    return this.quotePoolRepository.findOneById(query.quoteId);
  }
}
