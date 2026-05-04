import { WisdomStory } from '../domain';
import { WisdomStoryEntity } from './entities';

export class WisdomStoryMapper {
  toDomain(entity: WisdomStoryEntity): WisdomStory {
    return new WisdomStory({
      id: entity.id,
      CMSId: entity.CMSId,
      imageUrl: entity.imageUrl ?? null,
      mood: entity.mood,
      beliefSystem: entity.beliefSystem,
      timeToRead: entity.timeToRead,
      createdAtCMS: entity.createdAtCMS,
      isFree: entity.isFree,
      translations: [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: WisdomStory): WisdomStoryEntity {
    const props = domain.getProps();
    return {
      id: props.id,
      CMSId: props.CMSId,
      imageUrl: props.imageUrl ?? undefined,
      mood: props.mood,
      beliefSystem: props.beliefSystem,
      timeToRead: props.timeToRead,
      isFree: props.isFree,
      createdAtCMS: props.createdAtCMS,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
