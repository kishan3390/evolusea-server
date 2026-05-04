import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { AccountController } from './account.controller';

@Module({
  imports: [DomainModule],
  controllers: [AccountController],
})
export class AccountApiModule {}
