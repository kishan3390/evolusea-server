import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  WisdomStoryEntity,
  WisdomStoryTranslationEntity,
} from './infrastructure/entities';
import { WisdomStoryRepository } from './domain';
import { PostgresWisdomStoryRepository } from './infrastructure/repositories/postgres-wisdom-story.repository';
import { GetWisdomStoryQueryHandler } from './application/queries/get-wisdom-story';
import { WisdomStoryFacade } from './wisdom-story.facade';
import { ListUserWisdomStoriesQueryHandler } from './application/queries/list-user-wisdom-stories';
import { DistributedLockModule } from '../../distributed-lock';
import { CmsModule } from '../../cms';
import { SyncWisdomStoriesWithCmsTask } from './infrastructure/tasks/sync-wisdom-stories-with-cms.task';
import { NoteModule } from '../note/note.module';
import { MoodCheckinModule } from '../mood-checkin/mood-checkin.module';
import { GetWisdomStoriesByIdsQueryHandler } from '@domain/wisdom-story/application/queries';
import { UserProfileModule } from '@domain/user-profile/user-profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WisdomStoryEntity, WisdomStoryTranslationEntity]),
    DistributedLockModule,
    CmsModule,
    NoteModule,
    MoodCheckinModule,
    UserProfileModule,
  ],
  providers: [
    {
      provide: WisdomStoryRepository,
      useClass: PostgresWisdomStoryRepository,
    },
    GetWisdomStoryQueryHandler,
    ListUserWisdomStoriesQueryHandler,
    SyncWisdomStoriesWithCmsTask,
    WisdomStoryFacade,
    GetWisdomStoriesByIdsQueryHandler,
  ],
  exports: [WisdomStoryFacade],
})
export class WisdomStoryModule {}
