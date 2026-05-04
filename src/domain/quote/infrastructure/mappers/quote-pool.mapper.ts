import { Mapper } from '@building-blocks/infrastructure';
import { QuotePoolItem } from '../../domain';
import { QuotePoolEntity } from '../entities';
import { QuotePoolMoods } from '@domain/quote/domain/enums/quote-pool-moods.enum';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';

export class QuotePoolMapper
  implements Mapper<QuotePoolItem, QuotePoolEntity>
{
  toDomain(entity: QuotePoolEntity): QuotePoolItem {
    return new QuotePoolItem({
      id: entity.id,
      content: entity.content,
      attribution: entity.attribution,
      source: entity.source ?? null,
      mood: entity.mood as QuotePoolMoods,
      beliefSystem: entity.beliefSystem as BeliefSystems,
      language: entity.language as Languages,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: QuotePoolItem): QuotePoolEntity {
    const props = domain.getProps();
    const entity = new QuotePoolEntity();
    entity.id = props.id;
    entity.content = props.content;
    entity.attribution = props.attribution;
    entity.source = props.source;
    entity.mood = props.mood;
    entity.beliefSystem = props.beliefSystem;
    entity.language = props.language;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }
}
