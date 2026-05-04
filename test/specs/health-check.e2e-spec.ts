import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../test-app';

describe('AWS can check the HealthCheck of the app (e2e)', () => {
  let app: TestApp;

  beforeEach(async (context) => {
    app = context.app;
  });

  it('/health (GET)', () => {
    return app
      .supertestRequest()
      .get('/health')
      .expect(HttpStatus.OK)
      .expect({ status: 'up' });
  });
});
