import { Pagination } from '@building-blocks/application';

export interface ListMoodCheckinsQuery {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
  pagination: Pagination;
}
