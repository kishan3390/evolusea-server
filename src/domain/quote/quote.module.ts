import { Module } from '@nestjs/common';
import { QuoteRealFacade } from '@domain/quote/quote-real.facade';
import {
  GetDailyQuotesQueryHandler,
  GetQuoteByIdQueryHandler,
  ListQuotePoolQueryHandler,
} from './application';
import { UserProfileModule } from '@domain/user-profile/user-profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  QuotePoolEntity,
  UserDailyQuoteEntity,
} from '@domain/quote/infrastructure/entities';
import { QuotePoolRepository, UserDailyQuoteRepository } from '@domain/quote/domain';
import { PostgresQuotePoolRepository } from '@domain/quote/infrastructure/repositories/postgres-quote-pool.repository';
import { PostgresUserDailyQuoteRepository } from '@domain/quote/infrastructure/repositories/postgres-user-daily-quote.repository';
import { QuoteFacade } from '@domain/quote/quote.facade';
import { GetQuotesQuotaQueryHandler } from '@domain/quote/application/queries/get-quotes-quota';
import { NoteModule } from '@domain/note/note.module';
import { MoodCheckinModule } from '@domain/mood-checkin/mood-checkin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuotePoolEntity, UserDailyQuoteEntity]),
    UserProfileModule,
    NoteModule,
    MoodCheckinModule,
  ],
  providers: [
    {
      provide: QuotePoolRepository,
      useClass: PostgresQuotePoolRepository,
    },
    {
      provide: UserDailyQuoteRepository,
      useClass: PostgresUserDailyQuoteRepository,
    },
    {
      provide: QuoteFacade,
      useClass: QuoteRealFacade,
    },
    GetDailyQuotesQueryHandler,
    GetQuoteByIdQueryHandler,
    GetQuotesQuotaQueryHandler,
    ListQuotePoolQueryHandler,
  ],
  exports: [QuoteFacade],
})
export class QuoteModule {}
