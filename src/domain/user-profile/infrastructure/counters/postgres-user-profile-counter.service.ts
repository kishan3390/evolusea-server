import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserProfileEntity } from '../entities';
import { UserProfileCounter } from '../../domain/user-profile.counter';

@Injectable()
export class PostgresUserProfileCounter extends UserProfileCounter {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
  ) {
    super();
  }

  async countUsersProfilesByAccountId(accountId: string): Promise<number> {
    return this.userProfileRepository.count({ where: { accountId } });
  }
}
