import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import {
  GetVisionBoardWithNestedDataQuery,
  GetVisionBoardWithNestedDataQueryResult,
} from './get-vision-board-with-nested-data.query';
import {
  VisionBoardItem,
  VisionBoardItemStatuses,
  VisionBoardRepository,
} from '../../../domain';
import { PathFacade } from '@domain/path/path.facade';
import { WisdomStoryFacade } from '@domain/wisdom-story/wisdom-story.facade';
import { NoteFacade } from '@domain/note/note.facade';
import { Path } from '@domain/path/domain';
import { Note } from '@domain/note/domain';
import { WisdomStory } from '@domain/wisdom-story/domain';

@Injectable()
export class GetVisionBoardWithNestedDataQueryHandler
  implements
    QueryHandler<
      GetVisionBoardWithNestedDataQuery,
      GetVisionBoardWithNestedDataQueryResult
    >
{
  constructor(
    private readonly visionBoardRepository: VisionBoardRepository,
    private readonly pathFacade: PathFacade,
    private readonly wisdomStoryFacade: WisdomStoryFacade,
    private readonly noteFacade: NoteFacade,
  ) {}

  async handle(
    query: GetVisionBoardWithNestedDataQuery,
  ): Promise<GetVisionBoardWithNestedDataQueryResult> {
    const visionBoard = await this.visionBoardRepository.findOneBy({
      visionBoardId: query.visionBoardId,
      userProfileId: query.userProfileId,
    });

    if (!visionBoard) {
      return {
        visionBoard: null,
        paths: [],
        wisdomStories: [],
        notes: [],
      };
    }

    const pathsIds = visionBoard.getPathsIds();
    const notesIds = visionBoard.getNoteIds();
    const wisdomStoriesIds = visionBoard.getWisdomStoriesIds();

    const [pathsByIds, notesByIds, wisdomStoriesByIds] = await Promise.all([
      this.pathFacade.getPathsByIds({
        userProfileId: query.userProfileId,
        pathsIds,
      }),
      this.noteFacade.getNotesByIds({
        userProfileId: query.userProfileId,
        notesIds,
      }),
      this.wisdomStoryFacade.getWisdomStoriesById({
        wisdomStoriesIds,
      }),
    ]);

    const paths = this.extractVisionBoardItems(
      pathsIds,
      pathsByIds,
      query.accountIsPremium,
      this.mapPathToVisionBoardItem,
    );
    const notes = this.extractVisionBoardItems(
      notesIds,
      notesByIds,
      query.accountIsPremium,
      this.mapNoteToVisionBoardItem,
    );
    const wisdomStories = this.extractVisionBoardItems(
      wisdomStoriesIds,
      wisdomStoriesByIds,
      query.accountIsPremium,
      this.mapWisdomStoryToVisionBoardItem,
    );

    return {
      visionBoard,
      paths,
      notes,
      wisdomStories,
    };
  }

  private extractVisionBoardItems<T>(
    ids: string[],
    dataByIds: Record<string, T | null>,
    accountIsPremium: boolean,
    mapper: (
      id: string,
      dataByIds: Record<string, T | null>,
      accountIsPremium: boolean,
    ) => VisionBoardItem<T>,
  ): VisionBoardItem<T>[] {
    return ids.reduce<VisionBoardItem<T>[]>((acc, id) => {
      const boardItem = mapper(id, dataByIds, accountIsPremium);
      acc.push(boardItem);
      return acc;
    }, []);
  }

  private mapPathToVisionBoardItem(
    id: string,
    pathsByIds: Record<string, Path | null>,
    accountIsPremium: boolean,
  ): VisionBoardItem<Path> {
    const dbPath = pathsByIds[id];
    if (!dbPath) {
      return VisionBoardItem.create({
        id,
        status: VisionBoardItemStatuses.NotFound,
      });
    }

    if (!accountIsPremium) {
      return VisionBoardItem.create({
        id,
        status: VisionBoardItemStatuses.Forbidden,
      });
    }

    return VisionBoardItem.create({
      id,
      status: VisionBoardItemStatuses.Ok,
      data: dbPath,
    });
  }

  private mapNoteToVisionBoardItem(
    id: string,
    notesByIds: Record<string, Note | null>,
    accountIsPremium: boolean,
  ): VisionBoardItem<Note> {
    const dbNote = notesByIds[id];
    if (!dbNote) {
      return VisionBoardItem.create({
        id,
        status: VisionBoardItemStatuses.NotFound,
      });
    }

    return VisionBoardItem.create({
      id,
      status: VisionBoardItemStatuses.Ok,
      data: dbNote,
    });
  }

  private mapWisdomStoryToVisionBoardItem(
    id: string,
    wisdomStoriesByIds: Record<string, WisdomStory | null>,
    accountIsPremium: boolean,
  ): VisionBoardItem<WisdomStory> {
    const dbWisdomStory = wisdomStoriesByIds[id];
    if (!dbWisdomStory) {
      return VisionBoardItem.create({
        id,
        status: VisionBoardItemStatuses.NotFound,
      });
    }

    if (!accountIsPremium && !dbWisdomStory.getIsFree()) {
      return VisionBoardItem.create({
        id,
        status: VisionBoardItemStatuses.Forbidden,
      });
    }

    return VisionBoardItem.create({
      id,
      status: VisionBoardItemStatuses.Ok,
      data: dbWisdomStory,
    });
  }
}
