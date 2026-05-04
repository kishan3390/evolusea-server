import { PaginatedList, Pagination } from '@building-blocks/application';
import { CompassChat } from '@domain/compass/domain/compass-chat';
import { CompassChatStatus } from '@domain/compass/domain/enums/compass-chat-status.enum';
import { Transaction } from '@building-blocks/infrastructure';

export interface FindCompassChatByParams {
  compassChatId: string;
  userProfileId: string;
}

export interface CompassChatFilters {
  userProfileId: string;
  status?: CompassChatStatus;
}

export interface CompassChatCountFilters {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export abstract class CompassChatRepository {
  abstract create(entity: CompassChat, tx?: Transaction): Promise<void>;
  abstract list(
    filters: CompassChatFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<CompassChat>>;
  abstract count(filters: CompassChatCountFilters): Promise<number>;
  abstract findOneBy(
    params: FindCompassChatByParams,
  ): Promise<CompassChat | null>;
  abstract update(entity: CompassChat, tx?: Transaction): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
