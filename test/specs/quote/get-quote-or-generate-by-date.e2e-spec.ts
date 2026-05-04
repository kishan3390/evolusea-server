import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { expect } from 'vitest';

describe('Get daily quotes (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given premium user, should return daily quotes', async () => {
    const user = await app.signedInVerifiedAccount();

    const dailyQuotesResponse = await user.quoteAPI.getDailyQuotes();
    expect(dailyQuotesResponse.status).toEqual(HttpStatus.OK);
    expect(dailyQuotesResponse.body.items).toBeDefined();
    expect(Array.isArray(dailyQuotesResponse.body.items)).toBe(true);
  });

  it('given free user, should return daily quotes', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });

    const dailyQuotesResponse = await user.quoteAPI.getDailyQuotes();
    expect(dailyQuotesResponse.status).toEqual(HttpStatus.OK);
    expect(dailyQuotesResponse.body.items).toBeDefined();
  });

  it('given user, daily quotes should have expected structure', async () => {
    const user = await app.signedInVerifiedAccount();

    const dailyQuotesResponse = await user.quoteAPI.getDailyQuotes();
    expect(dailyQuotesResponse.status).toEqual(HttpStatus.OK);

    if (dailyQuotesResponse.body.items.length > 0) {
      expect(dailyQuotesResponse.body.items[0]).toMatchObject({
        id: expect.any(String),
        content: expect.any(String),
        attribution: expect.any(String),
        mood: expect.any(String),
        beliefSystem: expect.any(String),
      });
    }
  });
});
