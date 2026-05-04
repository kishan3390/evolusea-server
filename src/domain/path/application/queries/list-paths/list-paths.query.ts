import { Pagination } from '@building-blocks/application';

export interface ListPathsQuery {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
  dateFrom?: string;
  dateTo?: string;
  pagination: Pagination;
}
