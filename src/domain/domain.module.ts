import { Module } from '@nestjs/common';
import { UserProfileModule } from '@domain/user-profile/user-profile.module';
import { AccountModule } from '@domain/account/account.module';
import { NotificationModule } from '@domain/notification/notification.module';
import { NoteModule } from './note/note.module';
import { CompassModule } from '@domain/compass/compass.module';
import { PromptModule } from '@domain/prompt/prompt.module';
import { CalendarModule } from '@domain/calendar/calendar.module';
import { QuoteModule } from '@domain/quote/quote.module';
import { PurchaseModule } from '@domain/purchase/purchase.module';
import { VisionBoardModule } from './vision-board/vision-board.module';
import { AiUsageModule } from './ai-usage/ai-usage.module';
import { MoodCheckinModule } from './mood-checkin/mood-checkin.module';
import { AchievementModule } from './achievement/achievement.module';

const modules = [
  UserProfileModule,
  AccountModule,
  NotificationModule,
  NoteModule,
  CompassModule,
  PromptModule,
  CalendarModule,
  QuoteModule,
  PurchaseModule,
  VisionBoardModule,
  AiUsageModule,
  MoodCheckinModule,
  AchievementModule,
];

@Module({
  imports: modules,
  exports: modules,
})
export class DomainModule {}
