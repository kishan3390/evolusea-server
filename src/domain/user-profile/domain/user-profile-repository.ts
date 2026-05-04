import { Transaction } from '@building-blocks/infrastructure';

import { UserProfile } from './user-profile';

export abstract class UserProfileRepository {
  abstract create(entity: UserProfile, tx?: Transaction): Promise<void>;
  abstract getByAccountId(accountId: string): Promise<UserProfile | undefined>;
  abstract getById(id: string): Promise<UserProfile | undefined>;
  abstract list(
    page: number,
    perPage: number,
  ): Promise<UserProfile[]>;
  abstract update(entity: UserProfile, tx?: Transaction): Promise<void>;
  abstract delete(accountId: string, tx?: Transaction): Promise<void>;
}
