export type EventPayload = object;

export abstract class EventBase<T extends EventPayload> {
  constructor(readonly payload: T) {}
}

export interface EventBaseConstructor<T extends EventPayload> {
  new (payload: T): EventBase<T>;
}
