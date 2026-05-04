import { Transform } from 'class-transformer';

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowercasedValue = value.toLowerCase();
      if (lowercasedValue === 'true' || lowercasedValue === '1') {
        return true;
      }
      if (lowercasedValue === 'false' || lowercasedValue === '0') {
        return false;
      }
    }
    return value;
  });
}
