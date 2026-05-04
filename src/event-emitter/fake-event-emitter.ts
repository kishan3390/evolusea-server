import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { EventBase, EventBaseConstructor, EventPayload } from './event';

type Callback<T> = (payload: T) => Promise<void>;

@Injectable()
export class FakeEventEmitter {
  private completedEvents: EventBase<EventPayload>[] = [];
  private readonly emitter = new EventEmitter2({});
  private stoppedEvents: string[] = [];
  private waitingEvents: EventBase<EventPayload>[] = [];
  private usedEvents = new Set<EventBaseConstructor<EventPayload>>();

  on<T extends EventPayload>(
    event: EventBaseConstructor<T>,
    callback: Callback<T>,
  ): void {
    const eventName = event.name;
    this.emitter.on(eventName, callback, {
      async: true,
      promisify: true,
    });
  }

  async emit<T extends EventPayload>(event: EventBase<T>): Promise<void> {
    this.usedEvents.add(
      event.constructor as EventBaseConstructor<EventPayload>,
    );

    const eventName = event.constructor.name;
    if (this.stoppedEvents.includes(eventName)) {
      this.waitingEvents.push(event);
      return;
    }
    await this.emitter.emitAsync(eventName, event.payload).then(() => {
      this.completedEvents.push(event);
    });
  }

  async emitMany<T extends EventPayload>(
    events: EventBase<T>[],
  ): Promise<void> {
    for (const event of events) {
      try {
        await this.emit(event);
      } catch (_) {
        /* empty */
      }
    }
  }

  async waitForAll(): Promise<void> {
    await this.resumeWaitingEvents();
    await Promise.all(
      [...this.usedEvents].map(async (eventName) => this.waitFor(eventName)),
    );
  }

  async waitFor<T extends EventPayload>(
    awaitedEvent: EventBaseConstructor<T>,
    matchPayload?: (payload: T) => boolean,
    timeout = 100,
    retries = 15,
  ) {
    if (retries === 0) {
      return false;
    }
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const event = this.completedEvents.find((e) => {
          if (e.constructor.name !== awaitedEvent.name) {
            return false;
          }

          if (matchPayload) {
            return matchPayload(e.payload as any);
          }

          return true;
        });
        if (event) {
          resolve(true);
        } else {
          this.waitFor(awaitedEvent, matchPayload, timeout, retries - 1).then(
            (r) => resolve(r),
          );
        }
      }, timeout);
    });
  }

  async clear() {
    this.completedEvents = [];
    this.stoppedEvents = [];
    this.waitingEvents = [];
  }

  stopEvents(eventNames: EventBaseConstructor<any>[]) {
    this.stoppedEvents = eventNames.map((e) => e.name);
  }

  async resumeWaitingEvents() {
    this.stoppedEvents = [];
    await Promise.all(this.waitingEvents.map((e) => this.emit(e)));
    this.waitingEvents = [];
  }

  isInWaitingEvents<T extends EventPayload>(
    eventName: EventBaseConstructor<T>,
    matchPayload?: (payload: T) => boolean,
  ): boolean {
    return !!this.waitingEvents.find((e) => {
      if (e.constructor.name !== eventName.name) {
        return false;
      }

      if (matchPayload) {
        return matchPayload(e.payload as any);
      }

      return true;
    });
  }
}
