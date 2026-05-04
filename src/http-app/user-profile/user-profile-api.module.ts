import { Module } from '@nestjs/common';
import { DomainModule } from '@domain/domain.module';

import { UserProfileController } from './user-profile.controller';

@Module({
  imports: [DomainModule],
  controllers: [UserProfileController],
})
export class UserProfileApiModule {}
