import { Pagination } from '@building-blocks/application';
import { QuotePoolMoods } from '@domain/quote/domain';
import { BeliefSystems } from '@domain/user-profile/domain';

export interface ListQuotePoolQuery {
  pagination: Pagination;
  mood?: QuotePoolMoods;
  beliefSystem?: BeliefSystems;
}
