import { Module } from '@nestjs/common';
import { PathModule } from '../../domain/path/path.module';
import { PathController } from './path.controller';

@Module({
  imports: [PathModule],
  controllers: [PathController],
})
export class PathApiModule {}
