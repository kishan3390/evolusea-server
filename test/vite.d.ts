import { TestApp, AuthPlatform, PublicActor } from './sut/test-app';
import { FakeIdentity } from './sut/fakers/identity.faker';

declare module 'vitest' {
  export interface TestContext {
    app: TestApp;
    authPlatform: AuthPlatform;
    publicActor: PublicActor;
    fake: {
      identity: FakeIdentity;
    };
  }
}

declare module '@vitest/runner' {
  interface TestContext {
    app: TestApp;
    authPlatform: AuthPlatform;
    publicActor: PublicActor;
    fake: {
      identity: FakeIdentity;
    };
  }
}
