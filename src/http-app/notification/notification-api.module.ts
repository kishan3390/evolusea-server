import { Module } from '@nestjs/common';
import { NotificationModule } from '@domain/notification/notification.module';
import { NotificationController } from './controllers/notification.controller';
import { NotificationPlaygroundController } from './controllers/notification-playground.controller';
import { appEnv } from '@config';
import { PathModule } from '@domain/path/path.module';
import { CalendarModule } from '@domain/calendar/calendar.module';
import { UserProfileModule } from '@domain/user-profile/user-profile.module';

const playgroundControllers =
  appEnv.isLocal() || appEnv.isDev() ? [NotificationPlaygroundController] : [];

@Module({
  imports: [NotificationModule, PathModule, CalendarModule, UserProfileModule],
  controllers: [NotificationController, ...playgroundControllers],
})
export class NotificationApiModule {}
