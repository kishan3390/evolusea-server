const defaultUrlBase = 'http://localhost';

export class UrlBase {
  constructor(private readonly urlBase: string) {}

  static fromEnv(env: string | undefined): UrlBase {
    return new this(env || defaultUrlBase);
  }

  toString(): string {
    return this.urlBase;
  }
}
