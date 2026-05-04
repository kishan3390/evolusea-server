import { VisionBoard, VisionBoardItem } from '@domain/vision-board/domain';
import { Note } from '@domain/note/domain';
import { Path } from '@domain/path/domain';
import { WisdomStory } from '@domain/wisdom-story/domain';

export interface GetVisionBoardWithNestedDataQuery {
  userProfileId: string;
  visionBoardId: string;
  accountIsPremium: boolean;
}

export type GetVisionBoardWithNestedDataQueryResult =
  | GetVisionBoardWithNestedDataQueryResultNonEmpty
  | GetVisionBoardWithNestedDataQueryResultEmpty;

export interface GetVisionBoardWithNestedDataQueryResultNonEmpty {
  visionBoard: VisionBoard;
  notes: VisionBoardItem<Note>[];
  paths: VisionBoardItem<Path>[];
  wisdomStories: VisionBoardItem<WisdomStory>[];
}

export interface GetVisionBoardWithNestedDataQueryResultEmpty {
  visionBoard: null;
  notes: [];
  paths: [];
  wisdomStories: [];
}
