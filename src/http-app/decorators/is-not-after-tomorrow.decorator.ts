import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNotAfterTomorrow(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotAfterTomorrow',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          const inputDate = new Date(value);

          if (isNaN(inputDate.getTime())) {
            return false;
          }

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(23, 59, 59, 999);

          inputDate.setHours(0, 0, 0, 0);

          return inputDate <= tomorrow;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be tomorrow or earlier`;
        },
      },
    });
  };
}
