import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { expect } from 'vitest';

describe('Get quotes quota (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given free tier user, should return quota with daily limit and browse not allowed', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });

    const getRes1 = await user.quoteAPI.getQuotesQuota();
    expect(getRes1.status).toEqual(HttpStatus.OK);
    expect(getRes1.body).toEqual({
      dailyLimit: expect.any(Number),
      browseAllowed: false,
    });
  });

  it('given premium tier user, should return quota with browse allowed', async () => {
    const user = await app.signedInVerifiedAccount();

    const getRes1 = await user.quoteAPI.getQuotesQuota();
    expect(getRes1.status).toEqual(HttpStatus.OK);
    expect(getRes1.body).toEqual({
      dailyLimit: expect.any(Number),
      browseAllowed: true,
    });
  });
});
