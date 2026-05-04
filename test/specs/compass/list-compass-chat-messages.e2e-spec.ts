import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';

import { expect } from 'vitest';
import {
  CompassChatSpeaker,
  CompassIntentions,
  CompassPersonalities,
  CompassTopics,
  Goals,
} from '@domain/compass/domain';
import { v4 as uuid } from 'uuid';

describe('List compass chat messages (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given no compass chats, fetching list of chat messages should fail', async () => {
    const user = await app.signedInVerifiedAccount();
    const res =
      await user.compassChatMessageAPI.listCompassChatMessages(uuid());
    expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given compass chat with 5 messages, fetching it should return paginated public compass chat messages list sorted by creation date ascendingly', async () => {
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

    const sendMessageRes1 =
      await user.compassChatMessageAPI.sendCompassChatMessage(
        startChatRes.body.id,
        {
          content: 'Test message',
        },
      );

    const sendMessageRes2 =
      await user.compassChatMessageAPI.sendCompassChatMessage(
        startChatRes.body.id,
        {
          content: 'Test message',
        },
      );

    const page1 = await user.compassChatMessageAPI.listCompassChatMessages(
      startChatRes.body.id,
      {
        page: 1,
        perPage: 2,
      },
    );
    expect(page1.status).toEqual(HttpStatus.OK);
    expect(page1.body).toEqual({
      items: [
        expect.objectContaining({
          compassChatId: startChatRes.body.id,
          speaker: CompassChatSpeaker.System,
        }),
        {
          ...sendMessageRes1.body.messages[1],
        },
      ],
      hasMore: true,
      totalPages: 3,
      totalItems: 5,
    });
    const page2 = await user.compassChatMessageAPI.listCompassChatMessages(
      startChatRes.body.id,
      {
        page: 2,
        perPage: 2,
      },
    );
    expect(page2.status).toEqual(HttpStatus.OK);
    expect(page2.body).toEqual({
      items: [
        expect.objectContaining({
          compassChatId: startChatRes.body.id,
          speaker: CompassChatSpeaker.System,
        }),
        {
          ...sendMessageRes2.body.messages[3],
        },
      ],
      hasMore: true,
      totalPages: 3,
      totalItems: 5,
    });
  });

  it('given user with one compass chat with one message, listing it should be possible only for its owner', async () => {
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

    await user.compassChatMessageAPI.sendCompassChatMessage(
      startChatRes.body.id,
      {
        content: 'Test message',
      },
    );

    await app.eventEmitter.waitForAll();

    const anotherUser = await app.signedInVerifiedAccount();
    const res = await anotherUser.compassChatMessageAPI.listCompassChatMessages(
      startChatRes.body.id,
    );
    expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  });
});
