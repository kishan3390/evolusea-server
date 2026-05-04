import * as dotenv from 'dotenv';

import {
  AiConfig,
  DatabaseConfig,
  FirebaseConfig,
  HealthCheckConfig,
  LoggerConfig,
  SentryConfig,
  SwaggerConfig,
} from './interfaces';
import { DomainConfig } from '@config/interfaces/domain-config';
import { StrapiConfig } from './interfaces/strapi-config';
import { RevenueCatConfig } from '@config/interfaces/revenue-cat-config';
import { FreeTierQuotaConfig } from '@config/interfaces/free-tier-quota-config';

export abstract class IConfig {
  appName: string;
  swagger: SwaggerConfig;
  sentry: SentryConfig;
  healthcheck: HealthCheckConfig;
  logger: LoggerConfig;
  database: DatabaseConfig;
  firebase: FirebaseConfig;
  strapi: StrapiConfig;
  ai: AiConfig;
  domain: DomainConfig;
  revenueCat: RevenueCatConfig;
  freeTierQuota: FreeTierQuotaConfig;
}

dotenv.config();

export const ConfigProvider: IConfig = (() => {
  const swaggerPath = '/api';
  const healthcheckPath = '/health';

  return {
    appName: 'BoilerPlate',
    swagger: {
      path: swaggerPath,
      version: '1.0.1',
      title: 'User Api Documentation',
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
      init: {
        tracesSampleRate: 0.05,
      },
      ignorePath: [swaggerPath, healthcheckPath],
    },
    healthcheck: {
      path: healthcheckPath,
    },
    logger: {
      level: 'debug',
      loggly: {
        stripColors: true,
        token: 'd7e9f7c9-7e3f-4a74-8081-0046049ff6ae',
        subdomain: 'droidsonroids',
        tags: ['evolusea-backend'],
        json: true,
        timestamp: true,
      },
    },
    database: {
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'db',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'secret',
      database: process.env.POSTGRES_DB || 'evolusea-backend',
    },
    firebase: {
      googleCredentialsEncoded: process.env.FIREBASE_CREDENTIALS_ENCODED,
    },
    ai: {
      openAiKey: process.env.OPENAI_API_KEY ?? '',
      geminiKey: process.env.GEMINI_API_KEY ?? '',
      anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
    },
    strapi: {
      url: process.env.STRAPI_URL ?? '',
      apiToken: process.env.STRAPI_API_TOKEN ?? '',
    },
    domain: {
      compass: {
        turnsCountSoftLimit:
          Number(process.env.COMPASS_TURNS_COUNT_SOFT_LIMIT) || 10,
        turnsCountHardLimit:
          Number(process.env.COMPASS_TURNS_COUNT_HARD_LIMIT) || 25,
      },
      wisdomStory: {
        strapiSyncCron:
          process.env.WISDOM_STORY_STRAPI_SYNC_CRON || '*/15 * * * *',
        strapiSyncTimezone:
          process.env.WISDOM_STORY_STRAPI_SYNC_TIMEZONE ?? 'UTC',
      },
    },
    revenueCat: {
      apiKeyV1: process.env.REVENUE_CAT_API_KEY_V1 ?? '',
      apiKeyV2: process.env.REVENUE_CAT_API_KEY_V2 ?? '',
      webhookKey: process.env.REVENUE_CAT_WEBHOOK_KEY ?? '',
      projectId: process.env.REVENUE_CAT_PROJECT_ID ?? '',
    },
    freeTierQuota: {
      dailyCompassChatsLimit: 2,
      dailyNotesLimit: 3,
      dailyPathsLimit: 3,
      visionBoardsLimit: 1,
    },
  };
})();
