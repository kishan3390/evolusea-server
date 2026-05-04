import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdmin } from '@firebase';
import {
  Message,
  MessagesEmitResult,
  NotificationProvider,
  TokenMessage,
  TopicMessage,
} from '@domain/notification/domain';

const BAD_TOKEN_ERROR_CODES = [
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
];

const MAX_TOKENS_PER_BATCH = 1000;
const MAX_CONCURRENT_REQUESTS = 5;

type SendNotificationResult = 'success' | 'invalid-token' | 'error';

@Injectable()
export class FirebaseNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(FirebaseNotificationProvider.name);

  constructor(private readonly firebaseApp: FirebaseAdmin) {}

  async emit(messages: Message[]): Promise<MessagesEmitResult> {
    const invalidPushTokenValues: string[] = [];

    if (messages.length === 0) {
      return { invalidPushTokenValues };
    }

    await Promise.all(
      messages.map(async (message) => {
        if ('token' in message) {
          const result = await this.sendNotificationViaPushToken(message);
          if (result === 'invalid-token') {
            invalidPushTokenValues.push(message.token);
          }
        } else if ('topic' in message) {
          await this.sendNotificationViaTopic(message);
        }
      }),
    );

    return {
      invalidPushTokenValues,
    };
  }

  async subscribe(topics: string[], tokens: string[]): Promise<void> {
    if (tokens.length === 0 || topics.length === 0) {
      return;
    }
    const tokensBatches = batchify(tokens, MAX_TOKENS_PER_BATCH);
    const tasks: (() => Promise<void>)[] = [];
    for (const topic of topics) {
      for (const tokensBatch of tokensBatches) {
        tasks.push(async () => {
          try {
            await this.firebaseApp
              .messaging()
              .subscribeToTopic(tokensBatch, topic);
          } catch (error: any) {
            this.logger.error(
              `Failed to subscribe tokens to topic "${topic}": ${error.message}`,
              error,
            );
          }
        });
      }
    }
    await runWithConcurrencyLimit(tasks, MAX_CONCURRENT_REQUESTS);
  }

  async unsubscribe(topics: string[], tokens: string[]): Promise<void> {
    if (tokens.length === 0 || topics.length === 0) {
      return;
    }

    const tokensBatches = batchify(tokens, MAX_TOKENS_PER_BATCH);
    const tasks: (() => Promise<void>)[] = [];
    for (const topic of topics) {
      for (const tokensBatch of tokensBatches) {
        tasks.push(async () => {
          try {
            await this.firebaseApp
              .messaging()
              .unsubscribeFromTopic(tokensBatch, topic);
          } catch (error) {
            this.logger.error(
              `Failed to unsubscribe from topic ${topic}`,
              error,
            );
          }
        });
      }
    }
    await runWithConcurrencyLimit(tasks, MAX_CONCURRENT_REQUESTS);
  }

  private async sendNotificationViaPushToken(
    message: TokenMessage,
  ): Promise<SendNotificationResult> {
    try {
      await this.firebaseApp.messaging().send({
        token: message.token,
        notification: {
          title: message.title,
          body: message.body ?? '', // ensure body is always provided, old iOS devices may not behave correctly without it
        },
        data: Object.entries(message?.data ?? {}).reduce(
          (agg, [k, v]) => {
            agg[k] = String(v);
            return agg;
          },
          {} as Record<string, string>,
        ),
        android: {
          priority: 'high',
          notification: {
            channelId: 'evolusea_channel',
          },
        },
      });
      return 'success';
    } catch (error) {
      if (this.isBadTokenError(error)) {
        return 'invalid-token';
      }
      this.logger.error(error);
      return 'error';
    }
  }

  private async sendNotificationViaTopic(
    message: TopicMessage,
  ): Promise<SendNotificationResult> {
    try {
      await this.firebaseApp.messaging().send({
        // optional condition; if provided, it will be used instead of the topic
        ...(message.condition
          ? { condition: message.condition }
          : { topic: message.topic }),
        notification: {
          title: message.title,
          body: message.body ?? '', // ensure body is always provided, old iOS devices may not behave correctly without it
        },
        data: Object.entries(message?.data ?? {}).reduce(
          (agg, [k, v]) => {
            agg[k] = String(v);
            return agg;
          },
          {} as Record<string, string>,
        ),
        android: {
          priority: 'high',
          notification: {
            channelId: 'evolusea_channel',
          },
        },
      });
      return 'success';
    } catch (error) {
      this.logger.error(error);
      return 'error';
    }
  }

  private isBadTokenError(error: any): boolean {
    if (error) {
      if (BAD_TOKEN_ERROR_CODES.includes(error.code)) {
        return true;
      }
    }
    return false;
  }
}

const batchify = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const runWithConcurrencyLimit = async <T>(
  tasks: (() => Promise<void>)[],
  concurrencyLimit: number,
): Promise<void> => {
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = task();
    executing.push(promise);

    if (executing.length >= concurrencyLimit) {
      await Promise.all(executing);
      executing.length = 0;
    }
  }

  await Promise.all(executing);
};
