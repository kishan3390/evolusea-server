import { Pagination } from '@building-blocks/application';

export interface ListNotesSummariesQuery {
  userProfileId: string;
  pagination: Pagination;
}
