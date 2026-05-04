import { TestApp } from './test-app';

type HttpMethod = 'get' | 'put' | 'post' | 'patch' | 'delete';

export class AuthenticatedRequest {
  constructor(
    private readonly app: TestApp,
    private readonly accessToken: string,
  ) {}

  get(path: string) {
    return this.executeRequest('get', path);
  }

  post(path: string) {
    return this.executeRequest('post', path);
  }

  put(path: string) {
    return this.executeRequest('put', path);
  }

  patch(path: string) {
    return this.executeRequest('patch', path);
  }

  delete(path: string) {
    return this.executeRequest('delete', path);
  }

  private executeRequest(method: HttpMethod, path: string) {
    return this.app
      .supertestRequest()
      [method](path)
      .set('Authorization', `Bearer ${this.accessToken}`);
  }
}
