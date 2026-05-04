import { Module } from '@nestjs/common';
import { DomainModule } from '@domain/domain.module';
import { VisionBoardController } from './vision-board.controller';
import { UserProfileModule } from '@domain/user-profile/user-profile.module';
import { VisionBoardModule } from '@domain/vision-board/vision-board.module';

@Module({
  imports: [DomainModule, UserProfileModule, VisionBoardModule],
  controllers: [VisionBoardController],
})
export class VisionBoardApiModule {}
