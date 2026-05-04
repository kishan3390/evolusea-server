import { Mapper } from '@building-blocks/infrastructure';

import { UserProfile } from '../domain';
import { UserProfileEntity } from './entities';

export class UserProfileMapper implements Mapper<UserProfile, UserProfileEntity> {
  toDomain(entity: UserProfileEntity): UserProfile {
    return new UserProfile({
      id: entity.id,
      accountId: entity.accountId,
      username: entity.username,
      countryCode: entity.countryCode,
      belief: entity.belief,
      biography: entity.biography,
      language: entity.language,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: UserProfile): UserProfileEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      accountId: props.accountId,
      username: props.username,
      countryCode: props.countryCode,
      belief: props.belief,
      biography: props.biography,
      language: props.language,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
