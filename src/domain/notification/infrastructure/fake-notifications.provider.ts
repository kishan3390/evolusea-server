import {
  Message,
  MessagesEmitResult,
  NotificationProvider,
} from '@domain/notification/domain';

export class FakeNotificationProvider implements NotificationProvider {
  private readonly _emitted: Message[] = [];
  private readonly _subscribedTopics: Record<string, string[]> = {};

  get emitted(): Message[] {
    return [...this._emitted];
  }

  get subscribedTopics(): Record<string, string[]> {
    return { ...this._subscribedTopics };
  }

  async emit(messages: Message[]): Promise<MessagesEmitResult> {
    this._emitted.push(...messages);
    return {
      invalidPushTokenValues: [],
    };
  }

  async subscribe(topics: string[], tokens: string[]): Promise<void> {
    for (const topic of topics) {
      if (!this._subscribedTopics[topic]) {
        this._subscribedTopics[topic] = [];
      }
      this._subscribedTopics[topic].push(...tokens);
    }
  }

  async unsubscribe(topics: string[], tokens: string[]): Promise<void> {
    for (const topic of topics) {
      if (this._subscribedTopics[topic]) {
        this._subscribedTopics[topic] = this._subscribedTopics[topic].filter(
          (token) => !tokens.includes(token),
        );
        if (this._subscribedTopics[topic].length === 0) {
          delete this._subscribedTopics[topic];
        }
      }
    }
  }
}
