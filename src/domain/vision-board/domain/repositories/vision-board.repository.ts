import { PaginatedList, Pagination } from '@building-blocks/application';
import { Transaction } from '@building-blocks/infrastructure';
import { VisionBoard } from '@domain/vision-board/domain';

export interface FindVisionBoardByParams {
  visionBoardId: string;
  userProfileId: string;
}

export interface VisionBoardFilters {
  userProfileId: string;
}

export interface VisionBoardCountFilters {
  userProfileId: string;
}

export abstract class VisionBoardRepository {
  abstract create(entity: VisionBoard, tx?: Transaction): Promise<void>;
  abstract update(entity: VisionBoard, tx?: Transaction): Promise<void>;
  abstract delete(visionBoardId: string): Promise<void>;
  abstract findOneBy(
    params: FindVisionBoardByParams,
  ): Promise<VisionBoard | null>;
  abstract list(
    filters: VisionBoardFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<VisionBoard>>;
  abstract count(filters: VisionBoardCountFilters): Promise<number>;
}
