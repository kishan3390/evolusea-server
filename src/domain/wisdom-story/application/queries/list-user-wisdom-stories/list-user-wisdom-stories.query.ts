import { Pagination } from '@building-blocks/application';

export interface ListUserWisdomStoriesQuery {
  userProfileId: string;
  pagination: Pagination;
  hasPremiumEntitlement: boolean;
}
