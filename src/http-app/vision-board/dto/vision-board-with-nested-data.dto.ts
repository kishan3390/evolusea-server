import {
  VisionBoard,
  VisionBoardItem,
  VisionBoardItemStatuses,
} from '@domain/vision-board/domain';
import { VisionBoardDto } from './vision-board.dto';
import { WisdomStoryDto } from '../../wisdom-story/dto';
import { NoteDto } from '../../note/dto';
import { PathDto } from '../../path/dto';
import { WisdomStory } from '@domain/wisdom-story/domain';
import { Note } from '@domain/note/domain';
import { Path } from '@domain/path/domain';
import { Languages } from '@domain/user-profile/domain';

export class VisionBoardWithNestedDataDto extends VisionBoardDto {
  wisdomStories: VisionBoardItemWisdomStoryDto[];
  notes: VisionBoardItemNoteDto[];
  paths: VisionBoardItemPathDto[];

  static fromEntity({
    visionBoard,
    wisdomStories,
    paths,
    notes,
    language,
  }: {
    visionBoard: VisionBoard;
    wisdomStories: VisionBoardItem<WisdomStory>[];
    paths: VisionBoardItem<Path>[];
    notes: VisionBoardItem<Note>[];
    language: Languages;
  }): VisionBoardWithNestedDataDto {
    const dto = VisionBoardDto.fromEntity({ visionBoard });
    return {
      ...dto,
      wisdomStories: wisdomStories.map((wisdomStory) =>
        VisionBoardItemWisdomStoryDto.fromEntity(wisdomStory, language),
      ),
      paths: paths.map((path) => VisionBoardItemPathDto.fromEntity(path)),
      notes: notes.map((path) => VisionBoardItemNoteDto.fromEntity(path)),
    };
  }
}

export class VisionBoardItemPathDto {
  id: string;
  status: VisionBoardItemStatuses;
  data: PathDto | null;

  static fromEntity(item: VisionBoardItem<Path>): VisionBoardItemPathDto {
    const itemData = item.getData();

    return {
      id: item.getId(),
      status: item.getStatus(),
      data: itemData ? PathDto.fromEntity(itemData) : null,
    };
  }
}

export class VisionBoardItemNoteDto {
  id: string;
  status: VisionBoardItemStatuses;
  data: NoteDto | null;

  static fromEntity(item: VisionBoardItem<Note>): VisionBoardItemNoteDto {
    const itemData = item.getData();

    return {
      id: item.getId(),
      status: item.getStatus(),
      data: itemData ? NoteDto.fromEntity(itemData) : null,
    };
  }
}

export class VisionBoardItemWisdomStoryDto {
  id: string;
  status: VisionBoardItemStatuses;
  data: WisdomStoryDto | null;

  static fromEntity(
    item: VisionBoardItem<WisdomStory>,
    language: Languages,
  ): VisionBoardItemWisdomStoryDto {
    const itemData = item.getData();

    return {
      id: item.getId(),
      status: item.getStatus(),
      data: itemData ? WisdomStoryDto.fromEntity(itemData, language) : null,
    };
  }
}
