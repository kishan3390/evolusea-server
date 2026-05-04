import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { FirebaseModule } from '@firebase/firebase.module';
import { UserProfileApiModule } from './user-profile/user-profile-api.module';
import { LookupsApiModule } from './lookup/lookup-api.module';
import { HealthCheckController } from './health-check.controller';
import { CustomHttpExceptionFilter, HttpExceptionFilter } from './filters';
import { DomainErrorFilter } from './filters/domain-error.filter';
import {
  AuthProvider,
  FirebaseAuthProvider,
  FirebaseAuthStrategy,
} from './authentication';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../domain/account/infrastructure';
import { AccountApiModule } from './account/account-api.module';
import { UserProfileEntity } from '../domain/user-profile/infrastructure';
import { NoteApiModule } from './note/note-api.module';
import { CompassApiModule } from './compass/compass-api.module';
import { PathApiModule } from './path/path-api.module';
import { NotificationApiModule } from './notification/notification-api.module';
import { WisdomStoryApiModule } from './wisdom-story/wisdom-story-api.module';
import { CalendarEventApiModule } from './calendar-events/calendar-event.module';
import { QuoteApiModule } from './quote/quote-api.module';
import { PurchaseApiModule } from './purchase/purchase-api.module';
import { VisionBoardApiModule } from './vision-board/vision-board-api.module';
import { MoodCheckinApiModule } from './mood-checkin/mood-checkin-api.module';
import { AchievementApiModule } from './achievement/achievement-api.module';
import { AccountModule } from '@domain/account/account.module';

@Module({
  imports: [
    UserProfileApiModule,
    AccountApiModule,
    LookupsApiModule,
    NoteApiModule,
    CompassApiModule,
    PathApiModule,
    QuoteApiModule,
    CalendarEventApiModule,
    NotificationApiModule,
    WisdomStoryApiModule,
    PurchaseApiModule,
    VisionBoardApiModule,
    MoodCheckinApiModule,
    AchievementApiModule,
    FirebaseModule,
    AccountModule,
    TypeOrmModule.forFeature([AccountEntity, UserProfileEntity]), //used in firebase strategy for completing AuthUser info
  ],
  providers: [
    {
      provide: AuthProvider,
      useClass: FirebaseAuthProvider,
    },
    FirebaseAuthStrategy,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CustomHttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainErrorFilter,
    },
  ],
  controllers: [HealthCheckController],
})
export class HttpAppModule {}
