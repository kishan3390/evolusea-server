import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserJourneySummaryQueryHandler } from './get-user-journey-summary.query-handler';
import { STREAK_MILESTONES } from '../../../domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';

describe('GetUserJourneySummaryQueryHandler', () => {
  let handler: GetUserJourneySummaryQueryHandler;
  let mockRepository: {
    findAllDatesByUserProfileId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRepository = {
      findAllDatesByUserProfileId: vi.fn().mockResolvedValue([]),
    };
    handler = new GetUserJourneySummaryQueryHandler(mockRepository as any);

    vi.spyOn(DateHelpers, 'getBangkokCurrentDateString').mockReturnValue(
      '2026-02-10',
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handle', () => {
    it('returns zeroes when user has no engagement dates', async () => {
      const result = await handler.handle({ userProfileId: 'user-1' });

      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(0);
      expect(result.totalDays).toBe(0);
    });

    it('queries the repository with the correct userProfileId', async () => {
      await handler.handle({ userProfileId: 'user-42' });

      expect(
        mockRepository.findAllDatesByUserProfileId,
      ).toHaveBeenCalledWith('user-42');
    });

    it('calculates current streak from consecutive days ending today', async () => {
      mockRepository.findAllDatesByUserProfileId.mockResolvedValue([
        '2026-02-08',
        '2026-02-09',
        '2026-02-10',
      ]);

      const result = await handler.handle({ userProfileId: 'user-1' });

      expect(result.currentStreak).toBe(3);
      expect(result.bestStreak).toBe(3);
      expect(result.totalDays).toBe(3);
    });

    it('returns nextMilestone as the first unachieved streak milestone', async () => {
      // No engagement — currentStreak = 0, bestStreak = 0
      const result = await handler.handle({ userProfileId: 'user-1' });

      const firstMilestone = [...STREAK_MILESTONES].sort(
        (a, b) => a.threshold - b.threshold,
      )[0];

      expect(result.nextMilestone).toEqual({
        id: firstMilestone.id,
        nameKey: firstMilestone.nameKey,
        threshold: firstMilestone.threshold,
        remaining: firstMilestone.threshold, // 0 current streak
      });
    });

    it('returns latestUnlockedMilestone when bestStreak exceeds a threshold', async () => {
      // 7 consecutive days ending today → bestStreak = 7
      mockRepository.findAllDatesByUserProfileId.mockResolvedValue([
        '2026-02-04',
        '2026-02-05',
        '2026-02-06',
        '2026-02-07',
        '2026-02-08',
        '2026-02-09',
        '2026-02-10',
      ]);

      const result = await handler.handle({ userProfileId: 'user-1' });

      // bestStreak = 7 should unlock streak-3 (threshold 3) and streak-7 (threshold 7)
      expect(result.latestUnlockedMilestone).toEqual(
        expect.objectContaining({
          id: 'streak-7',
          threshold: 7,
        }),
      );
    });

    it('returns null nextMilestone when all milestones are unlocked', async () => {
      // Generate enough dates to exceed the highest streak milestone (365)
      const dates: string[] = [];
      const startDate = new Date('2025-02-10');
      for (let i = 0; i <= 365; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      mockRepository.findAllDatesByUserProfileId.mockResolvedValue(dates);

      const result = await handler.handle({ userProfileId: 'user-1' });

      expect(result.nextMilestone).toBeNull();
      expect(result.latestUnlockedMilestone).toEqual(
        expect.objectContaining({
          id: 'streak-365',
          threshold: 365,
        }),
      );
    });

    it('sets remaining as threshold minus currentStreak on nextMilestone', async () => {
      // 2-day streak: next milestone is streak-3 (threshold 3), remaining = 3 - 2 = 1
      mockRepository.findAllDatesByUserProfileId.mockResolvedValue([
        '2026-02-09',
        '2026-02-10',
      ]);

      const result = await handler.handle({ userProfileId: 'user-1' });

      expect(result.nextMilestone).toEqual(
        expect.objectContaining({
          id: 'streak-3',
          threshold: 3,
          remaining: 1,
        }),
      );
    });

    it('returns null latestUnlockedMilestone when no milestones are achieved', async () => {
      const result = await handler.handle({ userProfileId: 'user-1' });

      expect(result.latestUnlockedMilestone).toBeNull();
    });
  });
});
