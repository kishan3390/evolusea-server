import { Injectable } from '@nestjs/common';
import { EventEmitter2 as NestJsEventEmitter } from '@nestjs/event-emitter';
import { EventBase, EventBaseConstructor, EventPayload } from './event';

type Callback<T> = (payload: T) => Promise<void> | void;

@Injectable()
export class EventEmitter {
  constructor(private readonly eventEmitter: NestJsEventEmitter) {
  }

  on<T extends EventPayload>(
    event: EventBaseConstructor<T>,
    callback: Callback<T>,
  ): void {
    const eventName = event.name;
    this.eventEmitter.on(eventName, callback, {
      async: true,
    });
  }

  emit<T extends EventPayload>(event: EventBase<T>): void {
    const eventName = event.constructor.name;
    const payloadDeepClone = JSON.parse(JSON.stringify(event.payload));
    this.eventEmitter.emit(eventName, payloadDeepClone);
  }

  emitMany<T extends EventPayload>(events: EventBase<T>[]): void {
    for (const event of events) {
      const eventName = event.constructor.name;
      this.eventEmitter.emit(eventName, event.payload);
    }
  }
}
