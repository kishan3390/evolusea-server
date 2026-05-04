import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { expect } from 'vitest';
import { v4 as uuid } from 'uuid';

describe('Get quote by id (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given non-existing quote id, should fail with 404', async () => {
    const user = await app.signedInVerifiedAccount();
    const quoteResponse = await user.quoteAPI.getQuoteById(uuid());
    expect(quoteResponse.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given existing quote from pool, should return it', async () => {
    const user = await app.signedInVerifiedAccount();

    // Get quotes from the pool
    const quotesResponse = await user.quoteAPI.listQuotePool({ page: 1, perPage: 1 });
    expect(quotesResponse.status).toEqual(HttpStatus.OK);
    expect(quotesResponse.body.items.length).toBeGreaterThan(0);

    const quoteId = quotesResponse.body.items[0].id;
    const quoteGetByIdResponse = await user.quoteAPI.getQuoteById(quoteId);
    expect(quoteGetByIdResponse.status).toEqual(HttpStatus.OK);
    expect(quoteGetByIdResponse.body.id).toEqual(quoteId);
  });

  it('given quote from pool, another user should also be able to access it', async () => {
    const user = await app.signedInVerifiedAccount();

    // Get a quote from the pool
    const quotesResponse = await user.quoteAPI.listQuotePool({ page: 1, perPage: 1 });
    const quoteId = quotesResponse.body.items[0].id;

    // Another user should also be able to access pool quotes
    const anotherUser = await app.signedInVerifiedAccount();
    const anotherUserQuoteResponse = await anotherUser.quoteAPI.getQuoteById(quoteId);
    expect(anotherUserQuoteResponse.status).toEqual(HttpStatus.OK);
  });
});
