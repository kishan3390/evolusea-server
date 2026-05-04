import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNotBeforeYesterday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotBeforeYesterday',
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

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          inputDate.setHours(0, 0, 0, 0);

          return inputDate >= yesterday;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be yesterday or later`;
        },
      },
    });
  };
}
