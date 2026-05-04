import { DOMAIN_EVENT_HANDLER_METADATA_KEY } from '../metadata-names';

export const OnDomainEvent =
  (event: string) =>
  (_: any, __: string, descriptor: any): void => {
    Reflect.defineMetadata(
      DOMAIN_EVENT_HANDLER_METADATA_KEY,
      event,
      descriptor.value,
    );
  };
