import * as Sentry from '@sentry/nestjs';
import { AxiosError } from 'axios';
import { EventHint, ErrorEvent } from '@sentry/core';
import { isAxiosError } from 'axios';
import 'dotenv/config';

const handleSentryBeforeSend = (event: ErrorEvent, hint: EventHint) => {
  addAxiosContextRecursive(event, hint?.originalException);
  return event;
};

const addAxiosContextRecursive = (event: ErrorEvent, error: unknown) => {
  if (isAxiosError(error)) {
    addAxiosContext(event, error);
  } else if (error instanceof Error && error.cause) {
    addAxiosContextRecursive(event, error.cause);
  }
};

function addAxiosContext(event: ErrorEvent, error: AxiosError) {
  if (error.response) {
    const contexts = { ...event.contexts };
    contexts.Axios = { Response: error.response };
    event.contexts = contexts;
  }
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: process.env.SENTRY_TRACE_SAMPLE
    ? Number(process.env.SENTRY_TRACE_SAMPLE)
    : 0.5,
  profilesSampleRate: process.env.SENTRY_PROFILE_SAMPLE
    ? Number(process.env.SENTRY_PROFILE_SAMPLE)
    : 0.5,
  beforeSend: handleSentryBeforeSend,
});
