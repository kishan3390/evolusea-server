import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';

describe('Sync account (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given non-existing account, synchronizing it should create the account', async () => {
    const user = await app.signedInVerifiedAccount({
      syncAuth: false,
      createProfile: false,
    });
    const res = await user.accountAPI.syncMyAuth();
    expect(res.status).toEqual(HttpStatus.CREATED);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: user.email,
      }),
    );
  });

  it('given existing account, synchronizing it should return the account data', async () => {
    const user = await app.signedInVerifiedAccount({
      syncAuth: true,
      createProfile: false,
    });
    const res = await user.accountAPI.syncMyAuth();
    expect(res.status).toEqual(HttpStatus.CREATED);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: user.id,
        email: user.email,
      }),
    );
  });
});
