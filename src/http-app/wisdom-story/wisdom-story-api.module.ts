import { Module } from '@nestjs/common';
import { WisdomStoryModule } from '../../domain/wisdom-story/wisdom-story.module';
import { WisdomStoryController } from './wisdom-story.controller';
import { UserProfileModule } from '../../domain/user-profile/user-profile.module';

@Module({
  imports: [WisdomStoryModule, UserProfileModule],
  controllers: [WisdomStoryController],
})
export class WisdomStoryApiModule {}
