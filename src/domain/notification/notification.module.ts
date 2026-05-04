import { Module } from '@nestjs/common';
import { FirebaseModule } from '@firebase/firebase.module';
import {
  NotificationProvider,
  NotificationPushTokenRepository,
} from '@domain/notification/domain';
import { FirebaseNotificationProvider } from '@domain/notification/infrastructure';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPushTokenEntity } from './infrastructure/entities';
import { PostgresNotificationPushTokenRepository } from './infrastructure/repositories/postgres-notification-push-token.repository';
import {
  RegisterNotificationPushTokenCommandHandler,
  UnregisterNotificationPushTokenCommandHandler,
} from './application';
import { NotificationPushTokenFacade } from './notification-push-token.facade';
import { SendNotificationToUserCommandHandler } from './application/commands/send-notification-to-user';
import { NotificationFacade } from './notification.facade';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationPushTokenEntity]),
    FirebaseModule,
  ],
  providers: [
    {
      provide: NotificationProvider,
      useClass: FirebaseNotificationProvider,
    },
    {
      provide: NotificationPushTokenRepository,
      useClass: PostgresNotificationPushTokenRepository,
    },
    RegisterNotificationPushTokenCommandHandler,
    UnregisterNotificationPushTokenCommandHandler,
    SendNotificationToUserCommandHandler,
    NotificationPushTokenFacade,
    NotificationFacade,
  ],
  exports: [NotificationPushTokenFacade, NotificationFacade],
})
export class NotificationModule {}
