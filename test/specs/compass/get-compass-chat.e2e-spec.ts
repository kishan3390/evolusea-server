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

describe('Get compass chat (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given non-existing compass chat, fetching it should return 404', async () => {
    const user = await app.signedInVerifiedAccount();
    const res = await user.compassChatAPI.getCompassChat(uuid());
    expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given existing compass chat, fetching it should return compass chat data', async () => {
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

    await app.eventEmitter.waitForAll();

    const getRes = await user.compassChatAPI.getCompassChat(
      startChatRes.body.id,
    );
    expect(getRes.status).toEqual(HttpStatus.OK);
    expect(getRes.body).toEqual(
      expect.objectContaining({
        id: startChatRes.body.id,
        userProfileId: userProfile.body.id,
        intention: CompassIntentions.Awareness,
        topic: CompassTopics.OpenQuestion,
        status: CompassChatStatus.Active,
        activeSpeaker: CompassChatSpeaker.User,
        updatedAt: expect.any(String),
        createdAt: startChatRes.body.createdAt,
      }),
    );
  });

  it('given existing multiple compass chats, fetching by id should return correct compass chat data', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    const startChatRes1 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    const startChatRes2 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    const startChatRes3 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });

    await app.eventEmitter.waitForAll();

    for (const chatResponse of [startChatRes1, startChatRes2, startChatRes3]) {
      const getRes = await user.compassChatAPI.getCompassChat(
        chatResponse.body.id,
      );
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: chatResponse.body.id,
        }),
      );
    }
  });

  it('given existing compass chat with includeMessages param, fetching it should return compass chat data with public messages', async () => {
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

    const getRes = await user.compassChatAPI.getCompassChat(
      startChatRes.body.id,
      { includeMessages: true },
    );
    expect(getRes.status).toEqual(HttpStatus.OK);
    expect(getRes.body).toEqual({
      id: startChatRes.body.id,
      userProfileId: userProfile.body.id,
      intention: CompassIntentions.Awareness,
      topic: CompassTopics.OpenQuestion,
      status: CompassChatStatus.Active,
      activeSpeaker: CompassChatSpeaker.User,
      turnsCount: 1,
      updatedAt: expect.any(String),
      createdAt: startChatRes.body.createdAt,
      messages: [
        {
          compassChatId: startChatRes.body.id,
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
  });

  it('given existing compass chat, fetching it by another user should return not found exception', async () => {
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

    const anotherUser = await app.signedInVerifiedAccount();
    const getRes = await anotherUser.compassChatAPI.getCompassChat(
      startChatRes.body.id,
    );
    expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
  });
});
