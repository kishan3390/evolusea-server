import { CommandHandler } from '@building-blocks/application';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UserProfileRepository } from '../../../domain';
import { UpdateUserProfileCommand } from './update-user-profile.command';

@Injectable()
export class UpdateUserProfileCommandHandler
  implements CommandHandler<UpdateUserProfileCommand>
{
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async handle(command: UpdateUserProfileCommand): Promise<void> {
    const user = await this.userProfileRepository.getByAccountId(
      command.accountId,
    );
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    user
      .setUsername(command.username)
      .setCountryCode(command.countryCode)
      .setBelief(command.belief)
      .setBiography(command.biography)
      .setLanguage(command.language);

    await this.userProfileRepository.update(user);
  }
}
