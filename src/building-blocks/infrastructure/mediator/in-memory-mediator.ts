import { DomainEvent, InternalError } from '@building-blocks/domain';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import wildcardMatch from 'wildcard-match';

import { DomainEventMediator, Handler } from './domain-event-mediator';
import { Transaction } from '../transaction';

export class InMemoryDomainEventMediator implements DomainEventMediator {
  private readonly logger = new Logger(InMemoryDomainEventMediator.name);
  private readonly handlers: Map<string, Handler[]> = new Map();

  async subscribe(type: string, handler: Handler): Promise<void> {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }

    const handlers = this.handlers.get(type) ?? [];
    handlers.push(handler);

    this.handlers.set(type, handlers);
  }

  async publish(event: DomainEvent, session?: Transaction): Promise<void> {
    const eventType = event.type;

    const specificEventHandlers = Array.from(this.handlers.entries())
      .filter(([key]) => {
        const isMatch = wildcardMatch(key, { separator: '.' });
        return isMatch(eventType);
      })
      .flatMap(([_, handlers]) => handlers);

    const eventHandlers = [...specificEventHandlers];

    if (eventHandlers.length === 0) {
      this.logger.warn(`No handlers found for event: ${eventType}`);

      Sentry.captureMessage(`No handlers found for event`, {
        extra: {
          event: event.type,
          payload: event.payload,
        },
      });

      return;
    }

    for (const handler of eventHandlers) {
      try {
        await handler(event, session);
      } catch (handlerError) {
        this.logger.error(
          `Handler failed: ${handler.name} with ${event.type}`,
          handlerError,
        );
        Sentry.captureException(handlerError, {
          extra: {
            handler: handler.name,
            event: event.type,
            payload: event.payload,
          },
        });

        throw new InternalError('Transaction failed', handlerError);
      }
    }
  }
}
