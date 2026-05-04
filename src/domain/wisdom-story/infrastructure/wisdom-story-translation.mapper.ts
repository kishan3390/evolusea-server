import { WisdomStoryTranslation } from '../domain/wisdom-story-translation';
import { WisdomStoryTranslationEntity } from './entities';

export class WisdomStoryTranslationMapper {
  toDomain(entity: WisdomStoryTranslationEntity): WisdomStoryTranslation {
    return new WisdomStoryTranslation({
      id: entity.id,
      wisdomStoryId: entity.wisdomStoryId,
      title: entity.title,
      content: entity.content,
      language: entity.language,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: WisdomStoryTranslation): WisdomStoryTranslationEntity {
    const props = domain.getProps();
    return {
      id: props.id,
      wisdomStoryId: props.wisdomStoryId,
      title: props.title,
      content: props.content,
      language: props.language,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
