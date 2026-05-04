import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { expect } from 'vitest';
import { ALL_ACHIEVEMENT_DEFINITIONS } from '../../../src/domain/achievement/domain';

describe('Achievement (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
    app.overrideConfig({
      freeTierQuota: {
        dailyNotesLimit: Number.MAX_SAFE_INTEGER,
      },
    });
  });

  describe('GET /users/me/achievements/summary', () => {
    it('given authenticated user with no activity, returns zeroed summary', async () => {
      const user = await app.signedInVerifiedAccount();

      const res = await user.achievementAPI.getJourneySummary();

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          currentStreak: 0,
          bestStreak: 0,
          totalDays: 0,
          latestUnlockedMilestone: null,
        }),
      );
      expect(res.body.nextMilestone).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          nameKey: expect.any(String),
          threshold: expect.any(Number),
          remaining: expect.any(Number),
        }),
      );
    });

    it('given user with note activity, returns streak of 1 for today', async () => {
      const user = await app.signedInVerifiedAccount();

      // Create a note to trigger daily engagement recording
      await user.noteAPI.createNote({
        title: 'Test Note',
        description: 'Test description',
        anonymousSharingEnabled: false,
      });
      await app.eventEmitter.waitForAll();

      const res = await user.achievementAPI.getJourneySummary();

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body.currentStreak).toBeGreaterThanOrEqual(1);
      expect(res.body.totalDays).toBeGreaterThanOrEqual(1);
    });

    it('given unauthenticated request, returns 401', async () => {
      const res = await app
        .supertestRequest()
        .get('/users/me/achievements/summary');

      expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /users/me/achievements', () => {
    it('given authenticated user with no activity, returns all achievement definitions', async () => {
      const user = await app.signedInVerifiedAccount();

      const res = await user.achievementAPI.getUserAchievements();

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body.achievements).toHaveLength(
        ALL_ACHIEVEMENT_DEFINITIONS.length,
      );
      expect(res.body.currentStreak).toBe(0);
      expect(res.body.bestStreak).toBe(0);
      expect(res.body.totalDays).toBe(0);
    });

    it('returns activityCounts with all zero counts for new user', async () => {
      const user = await app.signedInVerifiedAccount();

      const res = await user.achievementAPI.getUserAchievements();

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body.activityCounts).toEqual(
        expect.objectContaining({
          compassChats: 0,
          notes: 0,
          pathsCompleted: 0,
          moodCheckins: 0,
          visionBoards: 0,
          accountAgeDays: expect.any(Number),
        }),
      );
    });

    it('returns account-0 (beginning) milestone as unlocked for any user', async () => {
      const user = await app.signedInVerifiedAccount();

      const res = await user.achievementAPI.getUserAchievements();

      const beginning = res.body.achievements.find(
        (a: any) => a.id === 'account-0',
      );
      expect(beginning).toBeDefined();
      expect(beginning.unlocked).toBe(true);
    });

    it('returns each achievement with the correct shape', async () => {
      const user = await app.signedInVerifiedAccount();

      const res = await user.achievementAPI.getUserAchievements();

      for (const achievement of res.body.achievements) {
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

    it('given user with note activity, notes-1 achievement is unlocked', async () => {
      const user = await app.signedInVerifiedAccount();

      // Create a note to trigger activity count
      await user.noteAPI.createNote({
        title: 'Achievement Note',
        description: 'Testing achievements',
        anonymousSharingEnabled: false,
      });
      await app.eventEmitter.waitForAll();

      const res = await user.achievementAPI.getUserAchievements();

      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body.activityCounts.notes).toBeGreaterThanOrEqual(1);

      const notes1 = res.body.achievements.find(
        (a: any) => a.id === 'notes-1',
      );
      expect(notes1?.unlocked).toBe(true);
      expect(notes1?.currentValue).toBeGreaterThanOrEqual(1);
    });

    it('given unauthenticated request, returns 401', async () => {
      const res = await app
        .supertestRequest()
        .get('/users/me/achievements');

      expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('each user sees only their own achievement data', async () => {
      const user1 = await app.signedInVerifiedAccount();
      const user2 = await app.signedInVerifiedAccount();

      // User1 creates a note
      await user1.noteAPI.createNote({
        title: 'User1 Note',
        description: 'Private',
        anonymousSharingEnabled: false,
      });
      await app.eventEmitter.waitForAll();

      const res1 = await user1.achievementAPI.getUserAchievements();
      const res2 = await user2.achievementAPI.getUserAchievements();

      expect(res1.body.activityCounts.notes).toBeGreaterThanOrEqual(1);
      expect(res2.body.activityCounts.notes).toBe(0);
    });
  });
});
