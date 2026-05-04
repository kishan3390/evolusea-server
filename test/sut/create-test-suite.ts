import { TestContext } from 'vitest';
import { appContainersFactory, DatabaseContainer } from './app-containers';
import { TestApp, TestAppFactory } from '../test-app';

export const createTestSuite = () => {
  let app: TestApp;
  let databaseContainer: DatabaseContainer;

  beforeAll(async () => {
    databaseContainer = await appContainersFactory.createDatabaseContainer();
  });

  beforeEach<TestContext>(async (context) => {
    app = await TestAppFactory.create();

    context.app = app;
  });

  afterEach<TestContext>(async () => {
    if (app) {
      await app.eventEmitter.waitForAll();
      await app.aiFacade.reset();
      if (databaseContainer) await databaseContainer.dropData();
      await app.close();
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (databaseContainer != null) await databaseContainer.releaseContainer();
  });
};
