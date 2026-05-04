import { DomainEvent } from '../../domain';
import { Transaction } from '../transaction';

export type Handler = (
  event: DomainEvent,
  tx?: Transaction,
) => Promise<void> | void;

export abstract class DomainEventMediator {
  abstract subscribe(type: string, handler: Handler): Promise<void>;
  abstract publish(event: DomainEvent, tx?: Transaction): Promise<void>;
}
