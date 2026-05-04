import { appContainersFactory } from './app-containers';
import { createTestSuite } from './create-test-suite';

createTestSuite();

afterAll(async () => {
  await appContainersFactory.shutdown();
});
