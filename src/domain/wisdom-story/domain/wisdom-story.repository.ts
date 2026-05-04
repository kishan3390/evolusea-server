import {
  PaginatedList,
  Pagination,
  Sort,
} from '../../../building-blocks/application';
import { WisdomStory, WisdomStoryProps } from './wisdom-story';
import { WisdomStoryBeliefSystems } from '@domain/wisdom-story/domain/enums';

export interface FindWisdomStoryByParams {
  cmsId?: string;
}

export interface FindManyWisdomStoriesByProfileAndIdsParams {
  wisdomStoriesIds: string[];
}

export type WisdomStorySort = Sort<
  Pick<WisdomStoryProps, 'createdAtCMS' | 'mood'>
>;

export interface WisdomStoryListFilters {
  beliefsSystems?: WisdomStoryBeliefSystems[];
  isFree?: boolean;
}

export abstract class WisdomStoryRepository {
  abstract create(entity: WisdomStory): Promise<void>;
  abstract findOneById(id: string): Promise<WisdomStory | null>;
  abstract findOneBy(
    params: FindWisdomStoryByParams,
  ): Promise<WisdomStory | null>;
  abstract findManyByProfileAndIds(
    params: FindManyWisdomStoriesByProfileAndIdsParams,
  ): Promise<Record<string, WisdomStory | null>>;
  abstract findAll(): Promise<WisdomStory[]>;
  abstract delete(id: string): Promise<void>;
  abstract update(entity: WisdomStory): Promise<void>;
  abstract list(
    filters: WisdomStoryListFilters,
    pagination: Pagination,
    sorts: WisdomStorySort[],
  ): Promise<PaginatedList<WisdomStory>>;
}
