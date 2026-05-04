import { VisionBoard } from '../../domain';
import { VisionBoardEntity } from '../entities';
import { Mapper } from '@building-blocks/infrastructure';

export class VisionBoardMapper
  implements Mapper<VisionBoard, VisionBoardEntity>
{
  toDomain(entity: VisionBoardEntity): VisionBoard {
    return new VisionBoard({
      id: entity.id,
      userProfileId: entity.userProfileId,
      title: entity.title,
      description: entity.description,
      pathsIds: entity.pathsIds ?? [],
      notesIds: entity.notesIds ?? [],
      wisdomStoriesIds: entity.wisdomStoriesIds ?? [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: VisionBoard): VisionBoardEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      userProfileId: props.userProfileId,
      title: props.title,
      description: props.description ?? null,
      pathsIds: [...props.pathsIds],
      notesIds: [...props.notesIds],
      wisdomStoriesIds: [...props.wisdomStoriesIds],
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
