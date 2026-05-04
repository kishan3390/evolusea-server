import { TestApp } from './TestApp';

describe('AWS can check the HealthCheck of the app (e2e)', () => {
  const app = TestApp.fromEnv();

  it('/health (GET)', async () => {
    const res = await app.get(`health`).send();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ status: 'up' });
  });
});
