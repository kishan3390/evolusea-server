import { VisionBoard } from '@domain/vision-board/domain';

export class VisionBoardDto {
  id: string;
  title: string;
  description: string | null;
  pathsIds: string[];
  notesIds: string[];
  wisdomStoriesIds: string[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity({
    visionBoard,
  }: {
    visionBoard: VisionBoard;
  }): VisionBoardDto {
    return {
      id: visionBoard.getId(),
      title: visionBoard.getTitle(),
      description: visionBoard.getDescription(),
      pathsIds: visionBoard.getPathsIds(),
      notesIds: visionBoard.getNoteIds(),
      wisdomStoriesIds: visionBoard.getWisdomStoriesIds(),
      createdAt: visionBoard.getCreatedAt(),
      updatedAt: visionBoard.getUpdatedAt(),
    };
  }
}
