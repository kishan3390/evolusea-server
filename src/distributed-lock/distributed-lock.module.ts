import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributedLock } from './distributed-lock.entity';
import { DistributedLockService } from './distributed-lock.service';

@Module({
  imports: [TypeOrmModule.forFeature([DistributedLock])],
  providers: [DistributedLockService],
  exports: [DistributedLockService],
})
export class DistributedLockModule {}
