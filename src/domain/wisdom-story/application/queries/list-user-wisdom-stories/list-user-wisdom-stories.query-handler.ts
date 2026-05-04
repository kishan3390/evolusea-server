import { Injectable } from '@nestjs/common';
import {
  PaginatedList,
  Pagination,
  QueryHandler,
  SortDirection,
} from '@building-blocks/application';
import {
  WisdomStory,
  WisdomStoryBeliefSystems,
  WisdomStoryListFilters,
  WisdomStoryRepository,
} from '../../../domain';
import { ListUserWisdomStoriesQuery } from './list-user-wisdom-stories.query';
import { NoteFacade } from '../../../../note/note.facade';
import { MoodCheckinFacade } from '@domain/mood-checkin/mood-checkin.facade';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';

@Injectable()
export class ListUserWisdomStoriesQueryHandler
  implements
    QueryHandler<ListUserWisdomStoriesQuery, PaginatedList<WisdomStory>>
{
  constructor(
    private readonly wisdomStoryRepository: WisdomStoryRepository,
    private readonly noteFacade: NoteFacade,
    private readonly moodCheckinFacade: MoodCheckinFacade,
    private readonly userProfile: UserProfileFacade,
  ) {}

  async handle(
    query: ListUserWisdomStoriesQuery,
  ): Promise<PaginatedList<WisdomStory>> {
    const userProfile = await this.userProfile.getByUserProfileId(
      query.userProfileId,
    );
    if (!userProfile) {
      return Pagination.default().getPaginatedList([], 0);
    }

    // Prefer mood from latest mood check-in, fall back to latest note
    const latestMoodCheckin =
      await this.moodCheckinFacade.getLatestMoodCheckin({
        userProfileId: query.userProfileId,
      });
    let hasMood = !!latestMoodCheckin;
    if (!hasMood) {
      const latestNote = await this.noteFacade.getLatestUserNote({
        userProfileId: query.userProfileId,
      });
      hasMood = !!latestNote && latestNote.getMood() !== null;
    }

    const sorts = hasMood
      ? [
          {
            field: 'mood' as const,
            direction: SortDirection.ASC,
          },
          {
            field: 'createdAtCMS' as const,
            direction: SortDirection.DESC,
          },
        ]
      : [
          {
            field: 'createdAtCMS' as const,
            direction: SortDirection.DESC,
          },
        ];

    const filter: WisdomStoryListFilters = {};
    filter.beliefsSystems = [userProfile.getBelief()];

    if (query.hasPremiumEntitlement) {
      filter.beliefsSystems.push(WisdomStoryBeliefSystems.General);
    } else {
      filter.isFree = true;
    }

    return this.wisdomStoryRepository.list(filter, query.pagination, sorts);
  }
}
