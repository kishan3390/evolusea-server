import { v4 as uuid } from 'uuid';
import { TestApp } from '../test-app';
import { AuthenticatedRequest } from '../authenticated-request';
import { SignedInAccount } from './signed-in-account';

export class TestAccountFactory {
  constructor(private readonly app: TestApp) {}

  createVerifiedAccount() {
    const email = `${uuid()}@gmail.com`;
    const firebaseId = this.app.authProvider.registerUser(email, true);
    const accessToken = this.app.authProvider.getAccessToken(firebaseId);
    return new SignedInAccount(
      firebaseId,
      email,
      new AuthenticatedRequest(this.app, accessToken),
    );
  }

  createUnverifiedAccount() {
    const email = `${uuid()}@gmail.com`;
    const firebaseId = this.app.authProvider.registerUser(email, false);
    const accessToken = this.app.authProvider.getAccessToken(firebaseId);
    return new SignedInAccount(
      firebaseId,
      email,
      new AuthenticatedRequest(this.app, accessToken),
    );
  }
}
