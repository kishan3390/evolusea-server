import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserProfileCounter } from './domain/user-profile.counter';
import { PostgresUserProfileCounter } from './infrastructure/counters/postgres-user-profile-counter.service';
import {
  UserProfileEntity,
  PostgresUserProfileRepository,
} from './infrastructure';
import { UserProfileRepository } from './domain';
import {
  CreateUserProfileCommandHandler,
  DeleteUserProfileCommandHandler,
  GetUserProfileQueryHandler,
  UpdateUserProfileCommandHandler,
} from './application';
import { UserProfileFacade } from './user-profile.facade';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfileEntity])],
  providers: [
    {
      provide: UserProfileRepository,
      useClass: PostgresUserProfileRepository,
    },
    {
      provide: UserProfileCounter,
      useClass: PostgresUserProfileCounter,
    },
    GetUserProfileQueryHandler,
    CreateUserProfileCommandHandler,
    UpdateUserProfileCommandHandler,
    DeleteUserProfileCommandHandler,
    UserProfileFacade,
  ],
  exports: [UserProfileFacade],
})
export class UserProfileModule {}
