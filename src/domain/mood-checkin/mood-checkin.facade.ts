import { Injectable } from '@nestjs/common';
import { MoodCheckin } from './domain';
import {
  CreateMoodCheckinCommand,
  CreateMoodCheckinCommandHandler,
  GetLatestMoodCheckinQuery,
  GetLatestMoodCheckinQueryHandler,
  ListMoodCheckinsQuery,
  ListMoodCheckinsQueryHandler,
} from './application';
import { PaginatedList } from '@building-blocks/application';

@Injectable()
export class MoodCheckinFacade {
  constructor(
    private readonly createMoodCheckinCommandHandler: CreateMoodCheckinCommandHandler,
    private readonly getLatestMoodCheckinQueryHandler: GetLatestMoodCheckinQueryHandler,
    private readonly listMoodCheckinsQueryHandler: ListMoodCheckinsQueryHandler,
  ) {}

  async createMoodCheckin(
    command: CreateMoodCheckinCommand,
  ): Promise<MoodCheckin> {
    return this.createMoodCheckinCommandHandler.handle(command);
  }

  async getLatestMoodCheckin(
    query: GetLatestMoodCheckinQuery,
  ): Promise<MoodCheckin | null> {
    return this.getLatestMoodCheckinQueryHandler.handle(query);
  }

  async listMoodCheckins(
    query: ListMoodCheckinsQuery,
  ): Promise<PaginatedList<MoodCheckin>> {
    return this.listMoodCheckinsQueryHandler.handle(query);
  }
}
