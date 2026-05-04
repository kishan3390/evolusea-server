import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { expect } from 'vitest';

describe('List quotes (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given premium user tier, should return paginated quote pool', async () => {
    const user = await app.signedInVerifiedAccount();

    const quotesResponse = await user.quoteAPI.listQuotePool({ page: 1, perPage: 10 });
    expect(quotesResponse.status).toEqual(HttpStatus.OK);
    expect(quotesResponse.body.items).toBeDefined();
    expect(quotesResponse.body.items.length).toBeGreaterThan(0);
    expect(quotesResponse.body.totalItems).toBeGreaterThan(0);
  });

  it('given premium user tier, should support pagination', async () => {
    const user = await app.signedInVerifiedAccount();

    const page1 = await user.quoteAPI.listQuotePool({ page: 1, perPage: 5 });
    expect(page1.status).toEqual(HttpStatus.OK);
    expect(page1.body.items.length).toEqual(5);

    const page2 = await user.quoteAPI.listQuotePool({ page: 2, perPage: 5 });
    expect(page2.status).toEqual(HttpStatus.OK);
    expect(page2.body.items.length).toEqual(5);

    // Pages should have different items
    expect(page1.body.items[0].id).not.toEqual(page2.body.items[0].id);
  });

  it('given free user tier, should respond with forbidden', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });

    const quotesResponse = await user.quoteAPI.listQuotePool();
    expect(quotesResponse.status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('given premium user, quote pool items should have expected structure', async () => {
    const user = await app.signedInVerifiedAccount();

    const quotesResponse = await user.quoteAPI.listQuotePool({ page: 1, perPage: 1 });
    expect(quotesResponse.status).toEqual(HttpStatus.OK);
    expect(quotesResponse.body.items[0]).toMatchObject({
      id: expect.any(String),
      content: expect.any(String),
      attribution: expect.any(String),
      mood: expect.any(String),
      beliefSystem: expect.any(String),
    });
  });
});
