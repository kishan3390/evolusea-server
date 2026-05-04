import { NotificationPushToken } from './notification-push-token';

export abstract class NotificationPushTokenRepository {
  abstract create(entity: NotificationPushToken): Promise<void>;
  abstract deleteByToken(token: string): Promise<void>;
  abstract findOneByToken(token: string): Promise<NotificationPushToken | null>;
  abstract findManyByAccountId(
    accountId: string,
  ): Promise<NotificationPushToken[]>;
  abstract deleteByTokenValues(tokenValues: string[]): Promise<void>;
}
