export enum AppEnvType {
  LOCAL = 'local',
  LOCAL_SENRY_TEST = 'local-sentry-test',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export class AppEnv {
  private readonly env: AppEnvType;

  constructor() {
    const processEnv: string | undefined = process.env.ENV;

    if (!processEnv || !AppEnv.validate(processEnv)) {
      this.env = AppEnvType.LOCAL;
    }

    this.env =
      Object.values(AppEnvType).find((appEnv) => appEnv === processEnv) ||
      AppEnvType.LOCAL;
  }

  static validate(env: string): boolean {
    return Object.values(AppEnvType).some((appEnv) => appEnv === env);
  }

  getEnv(): AppEnvType {
    return this.env;
  }

  isLocal(): boolean {
    return this.env === AppEnvType.LOCAL;
  }

  isLocalSentryTest(): boolean {
    return this.env === AppEnvType.LOCAL_SENRY_TEST;
  }

  isDev(): boolean {
    return this.env === AppEnvType.DEVELOPMENT;
  }

  isStaging(): boolean {
    return this.env === AppEnvType.STAGING;
  }

  isProduction(): boolean {
    return this.env === AppEnvType.PRODUCTION;
  }
}

export const appEnv: AppEnv = new AppEnv();
