import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisionBoardEntity } from './infrastructure/entities';
import { VisionBoardRepository } from './domain';
import { PostgresVisionBoardRepository } from './infrastructure/repositories/postgres-vision-board.repository';
import {
  CreateVisionBoardCommandHandler,
  DeleteVisionBoardCommandHandler,
  GetVisionBoardQueryHandler,
  GetVisionBoardWithNestedDataQueryHandler,
  ListVisionBoardsQueryHandler,
  UpdateVisionBoardCommandHandler,
} from './application';
import { VisionBoardFacade } from './vision-board.facade';
import { GetVisionBoardsQuotaQueryHandler } from '@domain/vision-board/application/queries/get-vision-boards-quota';
import { PathModule } from '@domain/path/path.module';
import { NoteModule } from '@domain/note/note.module';
import { WisdomStoryModule } from '@domain/wisdom-story/wisdom-story.module';
import { EventEmitterModule } from '../../event-emitter/event-emitter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisionBoardEntity]),
    PathModule,
    NoteModule,
    WisdomStoryModule,
    EventEmitterModule,
  ],
  providers: [
    {
      provide: VisionBoardRepository,
      useClass: PostgresVisionBoardRepository,
    },
    CreateVisionBoardCommandHandler,
    UpdateVisionBoardCommandHandler,
    DeleteVisionBoardCommandHandler,
    GetVisionBoardQueryHandler,
    ListVisionBoardsQueryHandler,
    VisionBoardFacade,
    GetVisionBoardsQuotaQueryHandler,
    GetVisionBoardWithNestedDataQueryHandler,
  ],
  exports: [VisionBoardFacade],
})
export class VisionBoardModule {}
