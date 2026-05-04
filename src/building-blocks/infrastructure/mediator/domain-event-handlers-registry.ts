import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DomainEvent } from '@building-blocks/domain';

import { DomainEventMediator } from '.';
import { DOMAIN_EVENT_HANDLER_METADATA_KEY } from './metadata-names';
import { Transaction } from '../transaction';
import { DomainEventArgumentsInjector } from './arguments-injector';

@Injectable()
export class DomainEventHandlersRegistry implements OnModuleInit {
  private providers: Record<string | symbol, unknown[]> = {};

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly mediator: DomainEventMediator,
  ) {}

  getProviders<T extends unknown[]>(key?: string | symbol): T {
    const providers = key
      ? this.providers[key]
      : Object.values(this.providers).flat();

    return (providers ?? []) as T;
  }

  onModuleInit(): void {
    this.scanDiscoverableInstanceWrappers(this.discoveryService.getProviders());
  }

  private scanDiscoverableInstanceWrappers(wrappers: InstanceWrapper[]): void {
    wrappers
      .filter((wrapper) => !!wrapper.instance && !wrapper.isAlias)
      .forEach((wrapper) => {
        const { instance } = wrapper;
        if (!instance || typeof instance !== 'object') {
          return;
        }

        const methods = this.metadataScanner.getAllMethodNames(instance);

        methods.forEach((methodKey) =>
          this.subscribeToEventIfListener(instance, methodKey),
        );
      });
  }

  private subscribeToEventIfListener(
    instance: Record<string, any>,
    methodKey: string,
  ): void {
    const eventType = this.reflector.get(
      DOMAIN_EVENT_HANDLER_METADATA_KEY,
      instance[methodKey],
    );

    if (eventType !== undefined) {
      this.assignHandler(eventType, instance, methodKey);
    }
  }

  private assignHandler(
    eventType: string,
    instance: Record<string, any>,
    methodKey: string,
  ): void {
    const handler = (event: DomainEvent, session?: Transaction) => {
      const injector = new DomainEventArgumentsInjector(event, session);
      return instance[methodKey].call(
        instance,
        ...injector.inject(instance, methodKey),
      );
    };

    this.mediator.subscribe(eventType, handler);
  }
}
