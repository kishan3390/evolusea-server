import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyEngagementEntity } from './infrastructure/entities';
import { DailyEngagementRepository } from './domain';
import { PostgresDailyEngagementRepository } from './infrastructure/repositories/postgres-daily-engagement.repository';
import { AchievementFacade } from './achievement.facade';
import {
  RecordDailyEngagementCommandHandler,
  GetUserJourneySummaryQueryHandler,
  GetUserAchievementsQueryHandler,
} from './application';
import { EventEmitterModule } from '../../event-emitter/event-emitter.module';
import { OnNoteCreatedRecordEngagementHandler } from './application/events/on-note-activity/on-note-activity.event-handler';
import { OnCompassChatClosedRecordEngagementHandler } from './application/events/on-compass-chat-closed/on-compass-chat-closed.event-handler';
import { OnMoodCheckinCreatedRecordEngagementHandler } from './application/events/on-mood-checkin-created/on-mood-checkin-created.event-handler';
import { OnPathCreatedRecordEngagementHandler } from './application/events/on-path-created/on-path-created.event-handler';
import { OnVisionBoardCreatedRecordEngagementHandler } from './application/events/on-vision-board-created/on-vision-board-created.event-handler';
import { NoteEntity } from '../note/infrastructure/entities/note.entity';
import { CompassChatEntity } from '../compass/infrastructure/entities/compass-chat.entity';
import { PathEntity } from '../path/infrastructure/entities/path.entity';
import { MoodCheckinEntity } from '../mood-checkin/infrastructure/entities/mood-checkin.entity';
import { VisionBoardEntity } from '../vision-board/infrastructure/entities/vision-board.entity';
import { UserProfileEntity } from '../user-profile/infrastructure/entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyEngagementEntity,
      NoteEntity,
      CompassChatEntity,
      PathEntity,
      MoodCheckinEntity,
      VisionBoardEntity,
      UserProfileEntity,
    ]),
    EventEmitterModule,
  ],
  providers: [
    {
      provide: DailyEngagementRepository,
      useClass: PostgresDailyEngagementRepository,
    },
    RecordDailyEngagementCommandHandler,
    GetUserJourneySummaryQueryHandler,
    GetUserAchievementsQueryHandler,
    AchievementFacade,
    // Event handlers
    OnNoteCreatedRecordEngagementHandler,
    OnCompassChatClosedRecordEngagementHandler,
    OnMoodCheckinCreatedRecordEngagementHandler,
    OnPathCreatedRecordEngagementHandler,
    OnVisionBoardCreatedRecordEngagementHandler,
  ],
  exports: [AchievementFacade],
})
export class AchievementModule {}
