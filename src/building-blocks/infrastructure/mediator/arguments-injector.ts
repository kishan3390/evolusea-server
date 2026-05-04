import { DomainEvent } from '@building-blocks/domain';

import { Transaction } from '../transaction';
import {
  EVENT_NAME_PARAM,
  EVENT_PARAM,
  EVENT_PAYLOAD_PARAM,
  EVENT_TRANSACTION_PARAM,
} from './metadata-names';

type DomainEventArgsMap = {
  [EVENT_PARAM]: DomainEvent;
  [EVENT_PAYLOAD_PARAM]: unknown;
  [EVENT_TRANSACTION_PARAM]?: Transaction;
  [EVENT_NAME_PARAM]: string;
};

type Param = keyof DomainEventArgsMap;

export class DomainEventArgumentsInjector {
  private readonly params: DomainEventArgsMap;

  constructor(event: DomainEvent, transaction?: Transaction) {
    this.params = {
      [EVENT_PARAM]: event,
      [EVENT_PAYLOAD_PARAM]: event.payload,
      [EVENT_TRANSACTION_PARAM]: transaction,
      [EVENT_NAME_PARAM]: event.type,
    };
  }

  inject(target: any, propertyKey: string): any[] {
    const params: Param[] = Reflect.getMetadata(
      'method:params',
      target,
      propertyKey,
    );

    if (!params) {
      return [];
    }

    return params.map((param) => {
      return this.params[param];
    });
  }
}
