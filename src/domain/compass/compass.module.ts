import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompassConfigFacade } from './compass-config.facade';
import { CompassConfigEntity } from './infrastructure/entities/compass-config.entity';
import {
  CompassChatMessageRepository,
  CompassConfigRepository,
} from './domain';
import { PostgresCompassConfigRepository } from './infrastructure/repositories/postgres-compass-config.repository';
import {
  CloseCompassChatCommandHandler,
  CompassChatClosedEventHandler,
  CreateCompassConfigCommandHandler,
  GetCompassChatQueryHandler,
  GetCompassConfigQueryHandler,
  ListCompassChatMessagesQueryHandler,
  GenerateAiCompassChatMessageCommandHandler,
  SendCompassChatMessageCommandHandler,
  UpdateCompassConfigCommandHandler,
  GenerateAiCompassChatContextMessageCommandHandler,
  StartCompassChatForPersonalNoteCommandHandler,
  StartCompassChatForPathItemCommandHandler,
  StartCompassChatForCalendarEventCommandHandler,
  GetCompassChatStartOptionsQueryHandler,
  ListCompassChatsSummariesQueryHandler,
  StartCompassChatForQuoteCommandHandler,
  GetCompassChatsQuotaQueryHandler,
} from '@domain/compass/application';
import { StartCompassChatForOpenQuestionCommandHandler } from '@domain/compass/application/commands/start-compass-chat-for-open-question';
import { CompassChatRealFacade } from '@domain/compass/compass-chat-real.facade';
import { AiModule } from '../../ai';
import { PromptModule } from '@domain/prompt/prompt.module';
import { CompassChatRepository } from '@domain/compass/domain/repositories/compass-chat.repository';
import { PostgresCompassChatRepository } from './infrastructure/repositories/postgres-compass-chat.repository';
import { CompassChatEntity } from '@domain/compass/infrastructure/entities/compass-chat.entity';
import { CompassChatMessageEntity } from '@domain/compass/infrastructure/entities/compass-chat-message.entity';
import { PostgresCompassChatMessageRepository } from '@domain/compass/infrastructure/repositories/postgres-compass-chat-message.repository';
import { UserProfileModule } from '@domain/user-profile/user-profile.module';
import { EventEmitterModule } from '../../event-emitter';
import { ListCompassChatsQueryHandler } from '@domain/compass/application/queries/list-compass-chats';
import { CompassChatMessageFacade } from '@domain/compass/compass-chat-message.facade';
import { CompassChatSummaryEntity } from '@domain/compass/infrastructure/entities/compass-chat-summary.entity';
import { PostgresCompassChatSummaryRepository } from '@domain/compass/infrastructure/repositories/postgres-compass-chat-summary.repository';
import { CompassChatSummaryRepository } from '@domain/compass/domain/repositories/compass-chat-summary.repository';
import { NoteModule } from '@domain/note/note.module';
import { PathModule } from '@domain/path/path.module';
import { GenerateAiCompassChatWelcomeMessageCommandHandler } from '@domain/compass/application/commands/generate-ai-compass-chat-welcome-message';
import { CalendarModule } from '@domain/calendar/calendar.module';
import { QuoteModule } from '@domain/quote/quote.module';
import { CompassChatFacade } from '@domain/compass/compass-chat.facade';
import { CompassConversationWindowingService } from '@domain/compass/application/services/compass-conversation-windowing.service';
import { CompassOutputSafetyFilterService } from '@domain/compass/application/services/compass-output-safety-filter.service';
import { CompassAbuseMonitorService } from '@domain/compass/application/services/compass-abuse-monitor.service';
import { CompassWelcomeCacheService } from '@domain/compass/application/services/compass-welcome-cache.service';
import { AiUsageModule } from '@domain/ai-usage/ai-usage.module';
import { HttpModule } from '@nestjs/axios';
import { TranscribeAudioCommandHandler } from '@domain/compass/application/commands/transcribe-audio';
import { CompassAudioFacade } from '@domain/compass/compass-audio.facade';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompassConfigEntity,
      CompassChatEntity,
      CompassChatMessageEntity,
      CompassChatSummaryEntity,
    ]),
    AiModule,
    PromptModule,
    UserProfileModule,
    EventEmitterModule,
    NoteModule,
    PathModule,
    CalendarModule,
    forwardRef(() => QuoteModule),
    AiUsageModule,
    HttpModule,
  ],
  providers: [
    CompassConfigFacade,
    CompassChatMessageFacade,
    CompassAudioFacade,
    {
      provide: CompassConfigRepository,
      useClass: PostgresCompassConfigRepository,
    },
    {
      provide: CompassChatRepository,
      useClass: PostgresCompassChatRepository,
    },
    {
      provide: CompassChatMessageRepository,
      useClass: PostgresCompassChatMessageRepository,
    },
    {
      provide: CompassChatSummaryRepository,
      useClass: PostgresCompassChatSummaryRepository,
    },
    {
      provide: CompassChatFacade,
      useClass: CompassChatRealFacade,
    },
    CreateCompassConfigCommandHandler,
    GetCompassConfigQueryHandler,
    UpdateCompassConfigCommandHandler,
    StartCompassChatForOpenQuestionCommandHandler,
    StartCompassChatForPersonalNoteCommandHandler,
    ListCompassChatsQueryHandler,
    GetCompassChatQueryHandler,
    SendCompassChatMessageCommandHandler,
    ListCompassChatMessagesQueryHandler,
    CloseCompassChatCommandHandler,
    CompassChatClosedEventHandler,
    GenerateAiCompassChatMessageCommandHandler,
    GenerateAiCompassChatContextMessageCommandHandler,
    GenerateAiCompassChatWelcomeMessageCommandHandler,
    StartCompassChatForPathItemCommandHandler,
    StartCompassChatForCalendarEventCommandHandler,
    GetCompassChatStartOptionsQueryHandler,
    ListCompassChatsSummariesQueryHandler,
    StartCompassChatForQuoteCommandHandler,
    GetCompassChatsQuotaQueryHandler,
    CompassConversationWindowingService,
    CompassOutputSafetyFilterService,
    CompassAbuseMonitorService,
    CompassWelcomeCacheService,
    TranscribeAudioCommandHandler,
  ],
  exports: [CompassConfigFacade, CompassChatFacade, CompassChatMessageFacade, CompassAudioFacade],
})
export class CompassModule {}
