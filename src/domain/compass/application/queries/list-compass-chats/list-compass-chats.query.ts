import { Pagination } from '@building-blocks/application';
import { CompassChatStatus } from '@domain/compass/domain';

export interface ListCompassChatsQuery {
  userProfileId: string;
  pagination: Pagination;
  status?: CompassChatStatus;
}
