import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';

import { GetUserProfileQuery } from './get-user-profile.query';
import { UserProfile, UserProfileRepository } from '../../../domain';

@Injectable()
export class GetUserProfileQueryHandler
  implements QueryHandler<GetUserProfileQuery, UserProfile>
{
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async handle(query: GetUserProfileQuery): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.getByAccountId(query.accountId);
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    return userProfile;
  }
}
