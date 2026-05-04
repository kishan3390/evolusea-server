import { DynamicModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { DomainEventMediator } from './domain-event-mediator';
import { InMemoryDomainEventMediator } from './in-memory-mediator';
import { DomainEventHandlersRegistry } from './domain-event-handlers-registry';

export class MediatorModule {
  static forRoot(): DynamicModule {
    return {
      imports: [DiscoveryModule],
      module: MediatorModule,
      global: true,
      providers: [
        DomainEventHandlersRegistry,
        {
          provide: DomainEventMediator,
          useFactory: () => new InMemoryDomainEventMediator(),
        },
      ],
      exports: [DomainEventMediator],
    };
  }
}
