import { Mapper } from '../../../building-blocks/infrastructure';
import { Path } from '../domain';
import { PathEntity } from './entities';

export class PathMapper implements Mapper<Path, PathEntity> {
  toDomain(entity: PathEntity): Path {
    return new Path({
      id: entity.id,
      userProfileId: entity.userProfileId,
      title: entity.title,
      description: entity.description,
      date: entity.date,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Path): PathEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      userProfileId: props.userProfileId,
      title: props.title,
      description: props.description,
      date: props.date,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
