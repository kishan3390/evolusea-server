import { Path, PathStatus } from '../../../domain/path/domain';

export class PathDto {
  id: string;
  title: string;
  description: string | null;
  date: string;
  status: PathStatus;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(path: Path): PathDto {
    return {
      id: path.getId(),
      title: path.getTitle(),
      description: path.getDescription(),
      date: path.getDate(),
      status: path.getStatus(),
      createdAt: path.getCreatedAt(),
      updatedAt: path.getUpdatedAt(),
    };
  }
}
