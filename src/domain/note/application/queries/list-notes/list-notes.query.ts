import { Pagination } from '@building-blocks/application';

export interface ListNotesQuery {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
  pagination: Pagination;
}
