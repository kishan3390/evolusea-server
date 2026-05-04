import { QuotePoolItem, QuotePoolMoods } from '@domain/quote/domain';
import { BeliefSystems } from '@domain/user-profile/domain';

export class QuotePoolItemDto {
  id: string;
  content: string;
  attribution: string;
  source: string | null;
  mood: QuotePoolMoods;
  beliefSystem: BeliefSystems;

  static fromEntity(item: QuotePoolItem): QuotePoolItemDto {
    return {
      id: item.getId(),
      content: item.getContent(),
      attribution: item.getAttribution(),
      source: item.getSource(),
      mood: item.getMood(),
      beliefSystem: item.getBeliefSystem(),
    };
  }
}
