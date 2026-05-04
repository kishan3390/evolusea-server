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
import { expect } from 'vitest';
import { v4 as uuid } from 'uuid';

describe('Send compass chat message (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given compass chat send when no compass chat exist, sending should fail', async () => {
    const user = await app.signedInVerifiedAccount();
    const sendMessageRes =
      await user.compassChatMessageAPI.sendCompassChatMessage(uuid(), {
        content: 'Test message',
      });
    expect(sendMessageRes.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given compass chat send when compass chat is closed, sending should fail', async () => {
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
    await app.eventEmitter.waitForAll();

    await user.compassChatAPI.closeCompassChat({
      compassChatId: startChatRes.body.id,
    });
    await app.eventEmitter.waitForAll();

    const sendMessageRes =
      await user.compassChatMessageAPI.sendCompassChatMessage(
        startChatRes.body.id,
        {
          content: 'Test message',
        },
      );
    await app.eventEmitter.waitForAll();
    expect(sendMessageRes.status).toEqual(HttpStatus.CONFLICT);
  });

  it('given compass chat send when compass chat exist, sending should succeed', async () => {
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
      await user.compassChatMessageAPI.sendCompassChatMessage(
        startChatRes.body.id,
        {
          content: 'Test message',
        },
      );
    expect(sendMessageRes.status).toEqual(HttpStatus.OK);
    expect(sendMessageRes.body).toEqual({
      activeSpeaker: CompassChatSpeaker.User,
      createdAt: expect.any(String),
      id: startChatRes.body.id,
      intention: CompassIntentions.Awareness,
      status: CompassChatStatus.Active,
      topic: CompassTopics.OpenQuestion,
      turnsCount: 2,
      updatedAt: expect.any(String),
      userProfileId: userProfile.body.id,
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
        },
      ],
    });

    const { body: preEventChatsData } =
      await user.compassChatAPI.getCompassChat(startChatRes.body.id);
    expect(preEventChatsData).toEqual({
      id: startChatRes.body.id,
      userProfileId: userProfile.body.id,
      intention: CompassIntentions.Awareness,
      topic: CompassTopics.OpenQuestion,
      status: CompassChatStatus.Active,
      activeSpeaker: CompassChatSpeaker.User,
      turnsCount: 2,
      updatedAt: expect.any(String),
      createdAt: startChatRes.body.createdAt,
    });

    const { body: compassChats } = await user.compassChatAPI.listCompassChats();
    expect(compassChats.totalItems).toEqual(1);

    const messagesResponse =
      await user.compassChatMessageAPI.listCompassChatMessages(
        startChatRes.body.id,
      );
    expect(messagesResponse.body.totalItems).toEqual(3);
  });
});
