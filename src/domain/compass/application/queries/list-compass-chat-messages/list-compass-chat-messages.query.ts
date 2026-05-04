import { Pagination } from '@building-blocks/application';

export interface ListCompassChatMessagesQuery {
  userProfileId: string;
  compassChatId: string;
  pagination: Pagination;
}
