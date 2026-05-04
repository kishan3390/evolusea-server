import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetDailyQuotesQuery } from './get-daily-quotes.query';
import {
  QuotePoolItem,
  QuotePoolRepository,
  UserDailyQuote,
  UserDailyQuoteRepository,
  QuotePoolMoods,
} from '@domain/quote/domain';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';
import { NoteFacade } from '@domain/note/note.facade';
import { MoodCheckinFacade } from '@domain/mood-checkin/mood-checkin.facade';
import { EntityIdGenerator } from '@building-blocks/domain';
import { BeliefSystems } from '@domain/user-profile/domain';
import { Moods } from '@domain/note/domain/enums';

@Injectable()
export class GetDailyQuotesQueryHandler
  implements QueryHandler<GetDailyQuotesQuery, QuotePoolItem[]>
{
  private readonly logger = new Logger(GetDailyQuotesQueryHandler.name);

  constructor(
    private readonly quotePoolRepository: QuotePoolRepository,
    private readonly userDailyQuoteRepository: UserDailyQuoteRepository,
    private readonly userProfileFacade: UserProfileFacade,
    private readonly noteFacade: NoteFacade,
    private readonly moodCheckinFacade: MoodCheckinFacade,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {}

  async handle(query: GetDailyQuotesQuery): Promise<QuotePoolItem[]> {
    const userProfile = await this.userProfileFacade.getByUserProfileId(
      query.userProfileId,
    );
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    // Check cache
    const cached = await this.userDailyQuoteRepository.findByUserAndDate(
      query.userProfileId,
      query.date,
    );
    if (cached.length > 0) {
      return cached
        .map((uq) => uq.getQuotePoolItem())
        .filter((item): item is QuotePoolItem => !!item);
    }

    // Get mood from latest mood check-in, fall back to latest note, then random
    const latestMoodCheckin =
      await this.moodCheckinFacade.getLatestMoodCheckin({
        userProfileId: query.userProfileId,
      });

    let mood: QuotePoolMoods;
    if (latestMoodCheckin) {
      mood = this.noteMoodToQuotePoolMood(latestMoodCheckin.getMood());
    } else {
      const latestNote = await this.noteFacade.getLatestUserNote({
        userProfileId: query.userProfileId,
      });
      mood =
        latestNote && latestNote.getMood()
          ? this.noteMoodToQuotePoolMood(latestNote.getMood()!)
          : this.getRandomMood();
    }

    const language = userProfile.getLanguage();
    const belief = userProfile.getBelief();

    let selectedQuotes: QuotePoolItem[];

    if (query.isPremium) {
      // 3 quotes
      const slot0 = await this.quotePoolRepository.findRandomByFilter(
        [belief],
        mood,
        language,
        1,
        [],
      );
      const slot0Ids = slot0.map((q) => q.getId());

      const slot1 = await this.quotePoolRepository.findRandomByFilter(
        [belief],
        mood,
        language,
        1,
        slot0Ids,
      );
      const slot01Ids = [...slot0Ids, ...slot1.map((q) => q.getId())];

      const slot2 = await this.quotePoolRepository.findRandomByFilter(
        [BeliefSystems.Other],
        mood,
        language,
        1,
        slot01Ids,
      );

      selectedQuotes = [...slot0, ...slot1, ...slot2];
    } else {
      // 1 quote
      selectedQuotes = await this.quotePoolRepository.findRandomByFilter(
        [belief, BeliefSystems.Other],
        mood,
        language,
        1,
        [],
      );
    }

    // Save to cache — wrapped in try/catch to handle race condition
    // where concurrent requests for the same user/date both pass the
    // cache check and attempt to insert, hitting the unique index constraint.
    if (selectedQuotes.length > 0) {
      try {
        const dailyQuotes = selectedQuotes.map((quote, index) =>
          UserDailyQuote.create({
            userProfileId: query.userProfileId,
            quotePoolId: quote.getId(),
            date: query.date,
            orderIndex: index,
            entityIdGenerator: this.entityIdGenerator,
          }),
        );
        await this.userDailyQuoteRepository.createBatch(dailyQuotes);
      } catch (error) {
        // Duplicate key means another concurrent request already cached quotes.
        // Re-read from cache and return those instead.
        this.logger.warn(
          `Race condition on daily quote cache for user ${query.userProfileId}, date ${query.date}. Re-reading from cache.`,
        );
        const fallback = await this.userDailyQuoteRepository.findByUserAndDate(
          query.userProfileId,
          query.date,
        );
        if (fallback.length > 0) {
          return fallback
            .map((uq) => uq.getQuotePoolItem())
            .filter((item): item is QuotePoolItem => !!item);
        }
        // If cache is still empty after retry, just return selected quotes without caching
      }
    }

    return selectedQuotes;
  }

  private noteMoodToQuotePoolMood(mood: Moods): QuotePoolMoods {
    const mapping: Record<string, QuotePoolMoods> = {
      [Moods.Overwhelmed]: QuotePoolMoods.Overwhelmed,
      [Moods.Uncertain]: QuotePoolMoods.Uncertain,
      [Moods.Calm]: QuotePoolMoods.Calm,
      [Moods.Motivated]: QuotePoolMoods.Motivated,
      [Moods.Grateful]: QuotePoolMoods.Grateful,
      [Moods.Restless]: QuotePoolMoods.Restless,
    };
    return mapping[mood] ?? QuotePoolMoods.Calm;
  }

  private getRandomMood(): QuotePoolMoods {
    const moods = Object.values(QuotePoolMoods);
    return moods[Math.floor(Math.random() * moods.length)];
  }
}
