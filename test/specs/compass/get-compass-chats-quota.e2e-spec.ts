import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import {
  CompassIntentions,
  CompassPersonalities,
  CompassTopics,
  Goals,
} from '@domain/compass/domain';
import { expect } from 'vitest';
import { purchaseApi, PurchaseAPI } from '../../helpers/apis/purchase-api';

describe('Get compass chats quota (e2e)', () => {
  let app: TestApp;
  let purchaseAPI: PurchaseAPI;

  beforeEach((context) => {
    app = context.app;
    purchaseAPI = purchaseApi(app);
  });

  it('given free tier user, should return quota allowing to start compass chats until reaching limit', async () => {
    app.overrideConfig({
      freeTierQuota: {
        dailyCompassChatsLimit: 2,
      },
    });

    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });

    const getRes1 = await user.compassChatAPI.getCompassChatsQuota();
    expect(getRes1.status).toEqual(HttpStatus.OK);
    expect(getRes1.body.create).toEqual({
      isAllowed: true,
      limit: 2,
      remaining: 2,
    });

    const startChatRes1 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    expect(startChatRes1.status).toEqual(HttpStatus.OK);

    const getRes2 = await user.compassChatAPI.getCompassChatsQuota();
    expect(getRes2.status).toEqual(HttpStatus.OK);
    expect(getRes2.body.create).toEqual({
      isAllowed: true,
      limit: 2,
      remaining: 1,
    });

    const startChatRes2 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    expect(startChatRes2.status).toEqual(HttpStatus.OK);

    const getRes3 = await user.compassChatAPI.getCompassChatsQuota();
    expect(getRes3.status).toEqual(HttpStatus.OK);
    expect(getRes3.body.create).toEqual({
      isAllowed: false,
      limit: 2,
      remaining: 0,
    });
  });

  it('given premium tier user, should return quota allowing to start unlimited compass chats', async () => {
    app.overrideConfig({
      freeTierQuota: {
        dailyCompassChatsLimit: 1,
      },
    });

    const user = await app.signedInVerifiedAccount();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    await purchaseAPI.setPremiumEntitlement(user.id);

    const getRes1 = await user.compassChatAPI.getCompassChatsQuota();
    expect(getRes1.status).toEqual(HttpStatus.OK);
    expect(getRes1.body.create).toEqual({
      isAllowed: true,
      limit: null,
      remaining: null,
    });

    const startChatRes1 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    expect(startChatRes1.status).toEqual(HttpStatus.OK);

    const getRes2 = await user.compassChatAPI.getCompassChatsQuota();
    expect(getRes2.status).toEqual(HttpStatus.OK);
    expect(getRes2.body.create).toEqual({
      isAllowed: true,
      limit: null,
      remaining: null,
    });

    const startChatRes2 = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    expect(startChatRes2.status).toEqual(HttpStatus.OK);

    const getRes3 = await user.compassChatAPI.getCompassChatsQuota();
    expect(getRes3.status).toEqual(HttpStatus.OK);
    expect(getRes3.body.create).toEqual({
      isAllowed: true,
      limit: null,
      remaining: null,
    });
  });
});
