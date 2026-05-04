import { Injectable } from '@nestjs/common';
import { CreatePathCommandHandler } from '@domain/path/application/commands/create-path/create-path.command-handler';
import {
  CompletePathCommand,
  CompletePathCommandHandler,
  GetPathsQuotaQuery,
  GetPathsQuotaQueryHandler,
  CreatePathCommand,
  DeletePathCommand,
  DeletePathCommandHandler,
  GetPathQuery,
  GetPathQueryHandler,
  ListPathsQuery,
  ListPathsQueryHandler,
  RestorePathCommand,
  RestorePathCommandHandler,
  UpdatePathCommand,
  UpdatePathCommandHandler,
  GetPathsQuotaQueryResult,
  GetPathsByIdsQueryHandler,
  GetPathsByIdsQuery,
  SendPathNotificationCommand,
  SendPathNotificationCommandHandler,
} from './application';
import { Path } from './domain';
import { PaginatedList } from '@building-blocks/application';

@Injectable()
export class PathFacade {
  constructor(
    private readonly createPathCommandHandler: CreatePathCommandHandler,
    private readonly deletePathCommandHandler: DeletePathCommandHandler,
    private readonly getPathQueryHandler: GetPathQueryHandler,
    private readonly updatePathCommandHandler: UpdatePathCommandHandler,
    private readonly listPathsQueryHandler: ListPathsQueryHandler,
    private readonly completePathCommandHandler: CompletePathCommandHandler,
    private readonly restorePathCommandHandler: RestorePathCommandHandler,
    private readonly getPathsQuotaQueryHandler: GetPathsQuotaQueryHandler,
    private readonly getPathsByIdsQueryHandler: GetPathsByIdsQueryHandler,
    private readonly sendPathNotificationCommandHandler: SendPathNotificationCommandHandler,
  ) {}

  async createPath(command: CreatePathCommand): Promise<Path> {
    return this.createPathCommandHandler.handle(command);
  }

  async deletePath(command: DeletePathCommand): Promise<void> {
    return this.deletePathCommandHandler.handle(command);
  }

  async getPath(query: GetPathQuery): Promise<Path | null> {
    return this.getPathQueryHandler.handle(query);
  }

  async getPathsByIds(
    query: GetPathsByIdsQuery,
  ): Promise<Record<string, Path | null>> {
    return this.getPathsByIdsQueryHandler.handle(query);
  }

  async updatePath(command: UpdatePathCommand): Promise<Path> {
    return this.updatePathCommandHandler.handle(command);
  }

  async listPaths(query: ListPathsQuery): Promise<PaginatedList<Path>> {
    return this.listPathsQueryHandler.handle(query);
  }

  async getPathsQuota(
    query: GetPathsQuotaQuery,
  ): Promise<GetPathsQuotaQueryResult> {
    return this.getPathsQuotaQueryHandler.handle(query);
  }

  async completePath(command: CompletePathCommand): Promise<Path> {
    return this.completePathCommandHandler.handle(command);
  }

  async restorePath(command: RestorePathCommand): Promise<Path> {
    return this.restorePathCommandHandler.handle(command);
  }

  async sendPathNotification(
    command: SendPathNotificationCommand,
  ): Promise<void> {
    return this.sendPathNotificationCommandHandler.handle(command);
  }
}
