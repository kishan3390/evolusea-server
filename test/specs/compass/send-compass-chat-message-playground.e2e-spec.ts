import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import {
  CompassChatSpeaker,
  CompassIntentions,
  CompassPersonalities,
  CompassTopics,
  Goals,
} from '@domain/compass/domain';
import { expect } from 'vitest';
import { v4 as uuid } from 'uuid';
import { AiProviders, AiReasoning } from '../../../src/ai';

describe('Send compass chat message playground (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given compass chat send message when no compass chat exist, sending should fail', async () => {
    const user = await app.signedInVerifiedAccount();
    const sendMessageRes =
      await user.compassChatMessageAPI.sendCompassChatMessagePlayground(
        uuid(),
        {
          content: 'Test message',
          developerOptions: {
            reasoning: AiReasoning.Default,
            model: 'test',
            provider: AiProviders.Gemini,
            compassConversationOverride: 'test'
          },
        },
      );
    expect(sendMessageRes.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given compass chat send message when compass chat is closed, sending should fail', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    const startChatRes = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });

    await user.compassChatAPI.closeCompassChat({
      compassChatId: startChatRes.body.id,
    });

    const sendMessageRes =
      await user.compassChatMessageAPI.sendCompassChatMessagePlayground(
        startChatRes.body.id,
        {
          content: 'Test message',
        },
      );
    expect(sendMessageRes.status).toEqual(HttpStatus.CONFLICT);
  });

  it('given compass chat send message when compass chat exist, sending should succeed', async () => {
    const user = await app.signedInVerifiedAccount();
    const userProfile = await user.userProfileApi.getMyProfile();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    const startChatRes = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });

    const sendMessageRes =
      await user.compassChatMessageAPI.sendCompassChatMessagePlayground(
        startChatRes.body.id,
        {
          content: 'Test message',
          developerOptions: {
            reasoning: AiReasoning.Default,
            model: 'test',
            provider: AiProviders.Gemini,
          },
        },
      );
    expect(sendMessageRes.status).toEqual(HttpStatus.OK);
    expect(sendMessageRes.body).toEqual({
      ...startChatRes.body,
      turnsCount: 2,
      updatedAt: expect.any(String),
      messages: [
        {
          compassChatId: startChatRes.body.id,
          content: 'Test response',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.System,
          updatedAt: expect.any(String),
          turnIndex: 1,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test message',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.User,
          updatedAt: expect.any(String),
          turnIndex: 1,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test response',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.System,
          updatedAt: expect.any(String),
          turnIndex: 2,
          metadata: null,
        }
      ]
    });

    const messagesResponse =
      await user.compassChatMessageAPI.listCompassChatMessages(
        startChatRes.body.id,
      );
    expect(messagesResponse.status).toEqual(HttpStatus.OK);
    expect(messagesResponse.body.totalItems).toEqual(3);
  });
});
