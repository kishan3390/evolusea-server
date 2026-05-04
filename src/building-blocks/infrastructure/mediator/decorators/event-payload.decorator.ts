import { EVENT_PAYLOAD_PARAM } from '../metadata-names';

export const EventPayload =
  () =>
  (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingParams: any[] =
      Reflect.getOwnMetadata('method:params', target, propertyKey) ?? [];

    existingParams[parameterIndex] = EVENT_PAYLOAD_PARAM;

    Reflect.defineMetadata(
      'method:params',
      existingParams,
      target,
      propertyKey,
    );
  };
