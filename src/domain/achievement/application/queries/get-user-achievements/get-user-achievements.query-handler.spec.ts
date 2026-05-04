import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GetUserAchievementsQueryHandler } from './get-user-achievements.query-handler';
import { ALL_ACHIEVEMENT_DEFINITIONS } from '../../../domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';

describe('GetUserAchievementsQueryHandler', () => {
  let handler: GetUserAchievementsQueryHandler;
  let mockDailyEngagementRepository: {
    findAllDatesByUserProfileId: ReturnType<typeof vi.fn>;
  };
  let mockNoteRepository: { count: ReturnType<typeof vi.fn> };
  let mockCompassChatRepository: { count: ReturnType<typeof vi.fn> };
  let mockPathRepository: { count: ReturnType<typeof vi.fn> };
  let mockMoodCheckinRepository: { count: ReturnType<typeof vi.fn> };
  let mockVisionBoardRepository: { count: ReturnType<typeof vi.fn> };
  let mockUserProfileRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  const USER_PROFILE_ID = 'user-profile-1';

  beforeEach(() => {
    mockDailyEngagementRepository = {
      findAllDatesByUserProfileId: vi.fn().mockResolvedValue([]),
    };
    mockNoteRepository = { count: vi.fn().mockResolvedValue(0) };
    mockCompassChatRepository = { count: vi.fn().mockResolvedValue(0) };
    mockPathRepository = { count: vi.fn().mockResolvedValue(0) };
    mockMoodCheckinRepository = { count: vi.fn().mockResolvedValue(0) };
    mockVisionBoardRepository = { count: vi.fn().mockResolvedValue(0) };
    mockUserProfileRepository = {
      findOne: vi.fn().mockResolvedValue({ createdAt: new Date() }),
    };

    handler = new GetUserAchievementsQueryHandler(
      mockDailyEngagementRepository as any,
      mockNoteRepository as any,
      mockCompassChatRepository as any,
      mockPathRepository as any,
      mockMoodCheckinRepository as any,
      mockVisionBoardRepository as any,
      mockUserProfileRepository as any,
    );

    vi.spyOn(DateHelpers, 'getBangkokCurrentDateString').mockReturnValue(
      '2026-02-10',
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handle', () => {
    it('returns streak data from daily engagement dates', async () => {
      mockDailyEngagementRepository.findAllDatesByUserProfileId.mockResolvedValue(
        ['2026-02-08', '2026-02-09', '2026-02-10'],
      );

      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      expect(result.currentStreak).toBe(3);
      expect(result.bestStreak).toBe(3);
      expect(result.totalDays).toBe(3);
    });

    it('queries all repositories with the correct userProfileId', async () => {
      await handler.handle({ userProfileId: USER_PROFILE_ID });

      expect(
        mockDailyEngagementRepository.findAllDatesByUserProfileId,
      ).toHaveBeenCalledWith(USER_PROFILE_ID);

      expect(mockNoteRepository.count).toHaveBeenCalledWith({
        where: { userProfileId: USER_PROFILE_ID },
      });
      expect(mockCompassChatRepository.count).toHaveBeenCalledWith({
        where: { userProfileId: USER_PROFILE_ID },
      });
      expect(mockPathRepository.count).toHaveBeenCalledWith({
        where: {
          userProfileId: USER_PROFILE_ID,
          status: 'completed',
        },
      });
      expect(mockMoodCheckinRepository.count).toHaveBeenCalledWith({
        where: { userProfileId: USER_PROFILE_ID },
      });
      expect(mockVisionBoardRepository.count).toHaveBeenCalledWith({
        where: { userProfileId: USER_PROFILE_ID },
      });
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: USER_PROFILE_ID },
        select: ['createdAt'],
      });
    });

    it('returns all achievement definitions with unlocked status', async () => {
      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      expect(result.achievements).toHaveLength(
        ALL_ACHIEVEMENT_DEFINITIONS.length,
      );

      // Each achievement should have the required shape
      for (const achievement of result.achievements) {
        expect(achievement).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            category: expect.any(String),
            nameKey: expect.any(String),
            threshold: expect.any(Number),
            unlocked: expect.any(Boolean),
            currentValue: expect.any(Number),
          }),
        );
      }
    });

    it('marks streak achievements as unlocked when bestStreak meets threshold', async () => {
      // 7-day streak
      mockDailyEngagementRepository.findAllDatesByUserProfileId.mockResolvedValue(
        [
          '2026-02-04',
          '2026-02-05',
          '2026-02-06',
          '2026-02-07',
          '2026-02-08',
          '2026-02-09',
          '2026-02-10',
        ],
      );

      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      const streak3 = result.achievements.find((a) => a.id === 'streak-3');
      const streak7 = result.achievements.find((a) => a.id === 'streak-7');
      const streak14 = result.achievements.find((a) => a.id === 'streak-14');

      expect(streak3?.unlocked).toBe(true);
      expect(streak7?.unlocked).toBe(true);
      expect(streak14?.unlocked).toBe(false);
    });

    it('marks activity achievements as unlocked when count meets threshold', async () => {
      mockNoteRepository.count.mockResolvedValue(12);
      mockCompassChatRepository.count.mockResolvedValue(1);

      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      // Notes: 12 → notes-1 (1) unlocked, notes-10 (10) unlocked, notes-25 (25) locked
      const notes1 = result.achievements.find((a) => a.id === 'notes-1');
      const notes10 = result.achievements.find((a) => a.id === 'notes-10');
      const notes25 = result.achievements.find((a) => a.id === 'notes-25');
      expect(notes1?.unlocked).toBe(true);
      expect(notes10?.unlocked).toBe(true);
      expect(notes25?.unlocked).toBe(false);

      // Compass: 1 → compass-1 (1) unlocked, compass-10 (10) locked
      const compass1 = result.achievements.find((a) => a.id === 'compass-1');
      const compass10 = result.achievements.find(
        (a) => a.id === 'compass-10',
      );
      expect(compass1?.unlocked).toBe(true);
      expect(compass10?.unlocked).toBe(false);
    });

    it('returns activity counts in the result', async () => {
      mockNoteRepository.count.mockResolvedValue(5);
      mockCompassChatRepository.count.mockResolvedValue(3);
      mockPathRepository.count.mockResolvedValue(2);
      mockMoodCheckinRepository.count.mockResolvedValue(10);
      mockVisionBoardRepository.count.mockResolvedValue(1);
      mockUserProfileRepository.findOne.mockResolvedValue({
        createdAt: new Date('2026-01-01'),
      });

      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      expect(result.activityCounts.notes).toBe(5);
      expect(result.activityCounts.compassChats).toBe(3);
      expect(result.activityCounts.pathsCompleted).toBe(2);
      expect(result.activityCounts.moodCheckins).toBe(10);
      expect(result.activityCounts.visionBoards).toBe(1);
      expect(result.activityCounts.accountAgeDays).toBeGreaterThanOrEqual(0);
    });

    it('calculates accountAgeDays from userProfile createdAt', async () => {
      // Account created 45 days ago
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - 45);
      mockUserProfileRepository.findOne.mockResolvedValue({ createdAt });

      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      // Allow ±1 day tolerance for test execution timing
      expect(result.activityCounts.accountAgeDays).toBeGreaterThanOrEqual(44);
      expect(result.activityCounts.accountAgeDays).toBeLessThanOrEqual(46);
    });

    it('returns accountAgeDays as 0 when userProfile is not found', async () => {
      mockUserProfileRepository.findOne.mockResolvedValue(null);

      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      expect(result.activityCounts.accountAgeDays).toBe(0);
    });

    it('returns account-0 (beginning) as unlocked for any user', async () => {
      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      const beginning = result.achievements.find(
        (a) => a.id === 'account-0',
      );
      expect(beginning?.unlocked).toBe(true);
      expect(beginning?.threshold).toBe(0);
    });

    it('sets currentValue correctly on each achievement category', async () => {
      mockNoteRepository.count.mockResolvedValue(15);
      mockMoodCheckinRepository.count.mockResolvedValue(8);

      const result = await handler.handle({
        userProfileId: USER_PROFILE_ID,
      });

      // All note achievements should have currentValue = 15
      const noteAchievements = result.achievements.filter(
        (a) => a.category === 'notes',
      );
      for (const a of noteAchievements) {
        expect(a.currentValue).toBe(15);
      }

      // All mood achievements should have currentValue = 8
      const moodAchievements = result.achievements.filter(
        (a) => a.category === 'mood-awareness',
      );
      for (const a of moodAchievements) {
        expect(a.currentValue).toBe(8);
      }
    });
  });
});
