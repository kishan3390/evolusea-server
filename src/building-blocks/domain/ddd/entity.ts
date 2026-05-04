import { BusinessRulable } from '@building-blocks/domain/ddd/business-rulable';

import { DomainEvent } from './domain-event';

export interface EntityProps {
  createdAt: Date;
  updatedAt: Date;
}

export abstract class Entity<Props extends EntityProps> extends BusinessRulable {
  private events: DomainEvent[] = [];

  protected createdAt: Date;
  protected updatedAt: Date;

  protected entityUpdated() {
    this.updatedAt = new Date();
  }

  equals(other: Entity<Props>): boolean {
    return this.getId() === other.getId();
  }

  protected addDomainEvent(event: DomainEvent) {
    this.events.push(event);
  }

  clearDomainEvents(): void {
    this.events.length = 0;
  }

  getDomainEvents(): readonly DomainEvent[] {
    return Object.freeze([...this.events]);
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  abstract getId(): string;

  abstract getProps(): Props;
}
