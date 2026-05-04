import { Injectable } from '@nestjs/common';

import {
  CreateUserProfileCommand,
  CreateUserProfileCommandHandler,
  DeleteUserProfileCommand,
  DeleteUserProfileCommandHandler,
  GetUserProfileQuery,
  GetUserProfileQueryHandler,
  UpdateUserProfileCommand,
  UpdateUserProfileCommandHandler,
} from './application';
import {
  UserProfile,
  UserProfileRepository,
} from '@domain/user-profile/domain';

@Injectable()
export class UserProfileFacade {
  constructor(
    private readonly getUserProfileQueryHandler: GetUserProfileQueryHandler,
    private readonly createUserProfileCommandHandler: CreateUserProfileCommandHandler,
    private readonly updateUserProfileCommandHandler: UpdateUserProfileCommandHandler,
    private readonly deleteUserProfileCommandHandler: DeleteUserProfileCommandHandler,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async getByAccountId(query: GetUserProfileQuery): Promise<UserProfile> {
    return this.getUserProfileQueryHandler.handle(query);
  }

  async getByUserProfileId(
    userProfileId: string,
  ): Promise<UserProfile | undefined> {
    return this.userProfileRepository.getById(userProfileId);
  }

  async createUser(command: CreateUserProfileCommand): Promise<string> {
    return this.createUserProfileCommandHandler.handle(command);
  }

  async updateUserProfile(command: UpdateUserProfileCommand): Promise<void> {
    await this.updateUserProfileCommandHandler.handle(command);
  }

  async deleteUserProfile(command: DeleteUserProfileCommand): Promise<void> {
    return this.deleteUserProfileCommandHandler.handle(command);
  }

  async list(page: number, perPage: number): Promise<UserProfile[]> {
    return this.userProfileRepository.list(page, perPage);
  }
}
