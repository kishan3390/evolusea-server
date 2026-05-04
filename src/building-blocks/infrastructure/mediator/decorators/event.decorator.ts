import { EVENT_PARAM } from '../metadata-names';

export const Event =
  () =>
  (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingParams: any[] =
      Reflect.getOwnMetadata('method:params', target, propertyKey) ?? [];

    existingParams[parameterIndex] = EVENT_PARAM;

    Reflect.defineMetadata(
      'method:params',
      existingParams,
      target,
      propertyKey,
    );
  };
