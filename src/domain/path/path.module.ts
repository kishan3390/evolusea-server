import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PathEntity } from './infrastructure/entities';
import { PathRepository } from './domain';
import {
  CompletePathCommandHandler,
  GetPathsQuotaQueryHandler,
  CreatePathCommandHandler,
  DeletePathCommandHandler,
  GetPathQueryHandler,
  ListPathsQueryHandler,
  RestorePathCommandHandler,
  UpdatePathCommandHandler,
  GetPathsByIdsQueryHandler,
  SendPathNotificationCommandHandler,
} from './application';
import { PathFacade } from './path.facade';
import { PostgresPathRepository } from './infrastructure/repositories/postgres-path.repository';
import { DistributedLockModule } from '../../distributed-lock';
import { MarkPastPathsAsOverdueTask } from './infrastructure/tasks/mark-past-paths-as-overdue.task';
import { TriggerPathNotificationsTask } from './infrastructure/tasks/trigger-path-notifications.task';
import { NotificationModule } from '../notification/notification.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { EventEmitterModule } from '../../event-emitter/event-emitter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PathEntity]),
    DistributedLockModule,
    NotificationModule,
    UserProfileModule,
    EventEmitterModule,
  ],
  providers: [
    {
      provide: PathRepository,
      useClass: PostgresPathRepository,
    },
    Logger,
    CreatePathCommandHandler,
    DeletePathCommandHandler,
    GetPathQueryHandler,
    UpdatePathCommandHandler,
    ListPathsQueryHandler,
    CompletePathCommandHandler,
    RestorePathCommandHandler,
    MarkPastPathsAsOverdueTask,
    TriggerPathNotificationsTask,
    PathFacade,
    GetPathsQuotaQueryHandler,
    GetPathsByIdsQueryHandler,
    SendPathNotificationCommandHandler,
  ],
  exports: [PathFacade],
})
export class PathModule {}
