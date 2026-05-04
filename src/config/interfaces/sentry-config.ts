export interface SentryConfig {
  dsn: string | undefined;
  init: {
    tracesSampleRate: number;
  };
  ignorePath: string[];
}
