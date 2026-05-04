import { UserDailyQuote } from '../user-daily-quote';

export abstract class UserDailyQuoteRepository {
  abstract findByUserAndDate(
    userProfileId: string,
    date: string,
  ): Promise<UserDailyQuote[]>;

  abstract createBatch(selections: UserDailyQuote[]): Promise<void>;
}
