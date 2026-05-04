export abstract class DomainEvent {
  abstract readonly type: string;

  abstract readonly payload: unknown;
}
