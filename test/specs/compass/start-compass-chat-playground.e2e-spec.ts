import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import {
  CompassChatSpeaker,
  CompassChatStatus,
  CompassIntentions,
  CompassPersonalities,
  CompassTopics,
  Goals,
} from '@domain/compass/domain';
import { AiReasoning } from '../../../src/ai';
import { expect } from 'vitest';

describe('Start compass chat playground (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
    app.overrideConfig({
      freeTierQuota: {
        dailyCompassChatsLimit: Number.MAX_SAFE_INTEGER,
      },
    });
  });

  describe('Start from open question', () => {
    it('given compass chat start when no compass config exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      const startChatRes = await user.compassChatAPI.startCompassChatPlayground(
        {
          intention: CompassIntentions.Awareness,
          details: {
            topic: CompassTopics.OpenQuestion,
          },
        },
      );
      expect(startChatRes.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('given compass chat start when compass config exist, starting should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      const userProfile = await user.userProfileApi.getMyProfile();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes = await user.compassChatAPI.startCompassChatPlayground(
        {
          intention: CompassIntentions.Awareness,
          details: {
            topic: CompassTopics.OpenQuestion,
          },
          developerOptions: {
            reasoning: AiReasoning.Default,
            compassContextPromptOverride: 'context prompt override',
            compassWelcomePromptOverride: 'welcome prompt override',
          },
        },
      );
      expect(startChatRes.status).toEqual(HttpStatus.OK);
      expect(startChatRes.body).toEqual({
        id: expect.any(String),
        userProfileId: userProfile.body.id,
        intention: CompassIntentions.Awareness,
        topic: CompassTopics.OpenQuestion,
        status: CompassChatStatus.Active,
        activeSpeaker: CompassChatSpeaker.User,
        turnsCount: 1,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        messages: [
          {
            compassChatId: expect.any(String),
            content: expect.any(String),
            createdAt: expect.any(String),
            id: expect.any(String),
            speaker: CompassChatSpeaker.System,
            updatedAt: expect.any(String),
            turnIndex: 1,
            metadata: null,
          },
        ],
      });

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);

      const compassChatMessages =
        await user.compassChatMessageAPI.listCompassChatMessages(
          startChatRes.body.id,
        );
      expect(compassChatMessages.body.totalItems).toEqual(1);
    });
  });
});
