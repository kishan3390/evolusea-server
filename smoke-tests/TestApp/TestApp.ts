import superagent from 'superagent';

import { UrlBase } from './UrlBase';

export class TestApp {
  constructor(private readonly urlBase: UrlBase) {}

  static fromEnv(): TestApp {
    return new this(UrlBase.fromEnv(process.env.URL_BASE));
  }

  get(path: string) {
    return superagent.get(`${this.urlBase}/${path}`);
  }

  getSwagger() {
    return superagent.get(`${this.urlBase}/api-yaml`);
  }
}
