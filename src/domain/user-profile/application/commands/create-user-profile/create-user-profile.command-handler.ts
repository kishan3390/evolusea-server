import { CommandHandler } from '@building-blocks/application';
import { EntityIdGenerator } from '@building-blocks/domain';
import { Injectable } from '@nestjs/common';

import { UserProfileCounter } from '../../../domain/user-profile.counter';
import { UserProfile, UserProfileRepository } from '../../../domain';
import { CreateUserProfileCommand } from './create-user-profile.command';

@Injectable()
export class CreateUserProfileCommandHandler
  implements CommandHandler<CreateUserProfileCommand, string>
{
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly userProfileCounter: UserProfileCounter,
  ) {}

  async handle(argument: CreateUserProfileCommand): Promise<string> {
    const userProfile = await UserProfile.create({
      accountId: argument.accountId,
      username: argument.username,
      countryCode: argument.countryCode,
      belief: argument.belief,
      biography: argument.biography,
      language: argument.language,
      entityIdGenerator: this.entityIdGenerator,
      usersIdentitiesCounter: this.userProfileCounter,
    });

    await this.userProfileRepository.create(userProfile);
    return userProfile.getId();
  }
}
