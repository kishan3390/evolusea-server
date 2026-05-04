import { Injectable } from '@nestjs/common';
import {
  CreateCompassConfigCommand,
  CreateCompassConfigCommandHandler,
  GetCompassConfigQuery,
  GetCompassConfigQueryHandler,
  UpdateCompassConfigCommand,
  UpdateCompassConfigCommandHandler,
} from './application';
import { CompassConfig } from './domain';

@Injectable()
export class CompassConfigFacade {
  constructor(
    private readonly createCompassConfigCommandHandler: CreateCompassConfigCommandHandler,
    private readonly getCompassConfigCommandHandler: GetCompassConfigQueryHandler,
    private readonly updateCompassConfigCommandHandler: UpdateCompassConfigCommandHandler,
  ) {}

  async createCompassConfig(
    command: CreateCompassConfigCommand,
  ): Promise<CompassConfig> {
    return this.createCompassConfigCommandHandler.handle(command);
  }

  async getCompassConfig(
    command: GetCompassConfigQuery,
  ): Promise<CompassConfig | null> {
    return this.getCompassConfigCommandHandler.handle(command);
  }

  async updateCompassConfig(
    command: UpdateCompassConfigCommand,
  ): Promise<CompassConfig> {
    return this.updateCompassConfigCommandHandler.handle(command);
  }
}
