import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';

import { expect } from 'vitest';
import {
  CompassIntentions,
  CompassPersonalities,
  CompassTopics,
  Goals,
} from '@domain/compass/domain';

describe('List compass chats (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given no compass chats, fetching it should return empty list', async () => {
    const user = await app.signedInVerifiedAccount();
    const res = await user.compassChatAPI.listCompassChats();
    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body).toEqual({
      items: [],
      hasMore: false,
      totalPages: 1,
      totalItems: 0,
    });
  });

  it('given 3 compass chats, fetching it should return paginated compass chats list sorted by creation date descendingly', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    const createRes1 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    const createRes2 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Evolution,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    const createRes3 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Wisdom,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });

    const page1 = await user.compassChatAPI.listCompassChats({
      page: 1,
      perPage: 2,
    });
    expect(page1.status).toEqual(HttpStatus.OK);
    expect(page1.body).toEqual({
      items: [
        expect.objectContaining({
          id: createRes3.body.id,
          intention: createRes3.body.intention,
        }),
        expect.objectContaining({
          id: createRes2.body.id,
          intention: createRes2.body.intention,
        }),
      ],
      hasMore: true,
      totalPages: 2,
      totalItems: 3,
    });
    const page2 = await user.compassChatAPI.listCompassChats({ page: 2, perPage: 2 });
    expect(page2.status).toEqual(HttpStatus.OK);
    expect(page2.body).toEqual({
      items: [
        expect.objectContaining({
          id: createRes1.body.id,
          intention: createRes1.body.intention,
        }),
      ],
      hasMore: false,
      totalPages: 2,
      totalItems: 3,
    });
  });

  it('given user with one compass chat, listing it should be possible only for its owner', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });

    const anotherUser = await app.signedInVerifiedAccount();
    const res = await anotherUser.compassChatAPI.listCompassChats();
    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body).toEqual({
      items: [],
      hasMore: false,
      totalPages: 1,
      totalItems: 0,
    });
  });

  // TODO implement tests for statuses - https://droidsonroids.atlassian.net/browse/BH-318
});
