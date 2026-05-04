import { EVENT_NAME_PARAM } from '../metadata-names';

export const EventName =
  () =>
  (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingParams: any[] =
      Reflect.getOwnMetadata('method:params', target, propertyKey) ?? [];

    existingParams[parameterIndex] = EVENT_NAME_PARAM;

    Reflect.defineMetadata(
      'method:params',
      existingParams,
      target,
      propertyKey,
    );
  };
