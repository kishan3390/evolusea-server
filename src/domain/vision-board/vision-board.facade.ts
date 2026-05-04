import { Injectable } from '@nestjs/common';
import { PaginatedList } from '@building-blocks/application';
import { VisionBoard } from './domain';
import {
  CreateVisionBoardCommand,
  CreateVisionBoardCommandHandler,
  DeleteVisionBoardCommand,
  DeleteVisionBoardCommandHandler,
  GetVisionBoardQuery,
  GetVisionBoardQueryHandler,
  ListVisionBoardsQuery,
  ListVisionBoardsQueryHandler,
  UpdateVisionBoardCommand,
  UpdateVisionBoardCommandHandler,
  GetVisionBoardsQuotaQueryResult,
  GetVisionBoardsQuotaQuery,
  GetVisionBoardsQuotaQueryHandler,
  GetVisionBoardWithNestedDataQuery,
} from './application';
import {
  GetVisionBoardWithNestedDataQueryHandler,
  GetVisionBoardWithNestedDataQueryResult,
} from '@domain/vision-board/application/queries/get-vision-board-with-nested-data';

@Injectable()
export class VisionBoardFacade {
  constructor(
    private readonly createVisionBoardCommandHandler: CreateVisionBoardCommandHandler,
    private readonly updateVisionBoardCommandHandler: UpdateVisionBoardCommandHandler,
    private readonly deleteVisionBoardCommandHandler: DeleteVisionBoardCommandHandler,
    private readonly getVisionBoardQueryHandler: GetVisionBoardQueryHandler,
    private readonly getVisionBoardWithNestedDataQueryHandler: GetVisionBoardWithNestedDataQueryHandler,
    private readonly listVisionBoardsQueryHandler: ListVisionBoardsQueryHandler,
    private readonly getVisionBoardsQuotaQueryHandler: GetVisionBoardsQuotaQueryHandler,
  ) {}

  createVisionBoard(command: CreateVisionBoardCommand): Promise<VisionBoard> {
    return this.createVisionBoardCommandHandler.handle(command);
  }

  updateVisionBoard(command: UpdateVisionBoardCommand): Promise<VisionBoard> {
    return this.updateVisionBoardCommandHandler.handle(command);
  }

  deleteVisionBoard(command: DeleteVisionBoardCommand): Promise<void> {
    return this.deleteVisionBoardCommandHandler.handle(command);
  }

  getVisionBoard(query: GetVisionBoardQuery): Promise<VisionBoard | null> {
    return this.getVisionBoardQueryHandler.handle(query);
  }

  getVisionBoardWithNestedData(
    query: GetVisionBoardWithNestedDataQuery,
  ): Promise<GetVisionBoardWithNestedDataQueryResult> {
    return this.getVisionBoardWithNestedDataQueryHandler.handle(query);
  }

  listVisionBoards(
    query: ListVisionBoardsQuery,
  ): Promise<PaginatedList<VisionBoard>> {
    return this.listVisionBoardsQueryHandler.handle(query);
  }

  getVisionBoardsQuota(
    query: GetVisionBoardsQuotaQuery,
  ): Promise<GetVisionBoardsQuotaQueryResult> {
    return this.getVisionBoardsQuotaQueryHandler.handle(query);
  }
}
