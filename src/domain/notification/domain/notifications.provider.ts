export type MessageData = {
  [key: string]: string;
};

export interface BaseMessage {
  title?: string;
  body?: string;
  data?: MessageData;
}

export interface TokenMessage extends BaseMessage {
  token: string;
}
export interface TopicMessage extends BaseMessage {
  topic: string;
  condition?: string;
}

export type Message = TokenMessage | TopicMessage;

export interface MessagesEmitResult {
  invalidPushTokenValues: string[];
}

export abstract class NotificationProvider {
  abstract emit(messages: Message[]): Promise<MessagesEmitResult>;
  abstract subscribe(topics: string[], tokens: string[]): Promise<void>;
  abstract unsubscribe(topics: string[], tokens: string[]): Promise<void>;
}
