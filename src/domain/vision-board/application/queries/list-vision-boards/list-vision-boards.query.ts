import { Pagination } from '@building-blocks/application';

export interface ListVisionBoardsQuery {
  userProfileId: string;
  pagination: Pagination;
}
