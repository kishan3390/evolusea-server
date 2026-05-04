import { CommandHandler } from '@building-blocks/application';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UserProfileRepository } from '../../../domain';
import { DeleteUserProfileCommand } from './delete-user-profile.command';

@Injectable()
export class DeleteUserProfileCommandHandler
  implements CommandHandler<DeleteUserProfileCommand>
{
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async handle(command: DeleteUserProfileCommand): Promise<void> {
    const userProfile = await this.userProfileRepository.getByAccountId(command.accountId);
    if (!userProfile) {
      throw new NotFoundException('User not found');
    }

    await this.userProfileRepository.delete(userProfile.getId());
  }
}
