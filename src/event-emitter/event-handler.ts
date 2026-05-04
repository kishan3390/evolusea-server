import { Transaction } from '@building-blocks/infrastructure';
import { Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from './event-emitter';
import { EventBase, EventBaseConstructor, EventPayload } from './event';
import { v4 as uuid } from 'uuid';

export abstract class EventHandler<Event extends EventBase<EventPayload>>
  implements OnModuleInit
{
  protected abstract readonly event: EventBaseConstructor<Event['payload']>;
  protected readonly logger: Logger;

  protected constructor(private readonly eventEmitter: EventEmitter) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    this.eventEmitter.on(this.event, this.handlerWrapper.bind(this));
    this.logger.log(`Started listening for event ${this.event.name}`);
  }

  private async handlerWrapper(payload: Event['payload']) {
    const eventId = uuid()
    this.logger.log(`Processing started`, { eventId });
    try {
      await this.handle(payload);
    } catch (error) {
      this.logger.error(`Processing failed`, error, { eventId });
    }
    this.logger.log(`Processing completed`, { eventId });
  }

  abstract handle(
    payload: Event['payload'],
    tx?: Transaction,
  ): Promise<void> | void;
}
