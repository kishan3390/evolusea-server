import { PaginatedList, Pagination, Sort } from '@building-blocks/application';
import {
  CompassChatMessage,
  CompassChatMessageProps,
  CompassChatMessageVisibility,
} from '@domain/compass/domain';
import { Transaction } from '@building-blocks/infrastructure';

export interface FindCompassChatMessageByParams {
  id: string;
  compassChatId: string;
}

export interface CompassChatMessageFilters {
  compassChatId: string;
  visibility?: CompassChatMessageVisibility;
}

export type CompassChatMessageSort = Sort<
  Pick<CompassChatMessageProps, 'createdAt'>
>;

export abstract class CompassChatMessageRepository {
  abstract create(entity: CompassChatMessage, tx?: Transaction): Promise<void>;
  abstract createMany(
    entity: CompassChatMessage[],
    tx?: Transaction,
  ): Promise<void>;
  abstract list(
    filters: CompassChatMessageFilters,
    pagination: Pagination,
    sorts: CompassChatMessageSort[],
  ): Promise<PaginatedList<CompassChatMessage>>;
  abstract findOneBy(
    params: FindCompassChatMessageByParams,
  ): Promise<CompassChatMessage | null>;
  abstract update(entity: CompassChatMessage): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
