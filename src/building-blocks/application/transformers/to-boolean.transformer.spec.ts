import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { ToBoolean } from './to-boolean.transformer';

class TestDto {
  @ToBoolean()
  testBoolean: boolean;
}

describe('ToBoolean transformer', () => {
  it('should convert string "true" to boolean true', async () => {
    const plain = { testBoolean: 'true' };
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toEqual(true);
  });

  it('should convert string "false" to boolean false', async () => {
    const plain = { testBoolean: 'false' };
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toEqual(false);
  });

  it('should convert string "1" to boolean true', async () => {
    const plain = { testBoolean: '1' };
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toEqual(true);
  });

  it('should convert string "0" to boolean false', async () => {
    const plain = { testBoolean: '0' };
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toEqual(false);
  });

  it('should accept actual boolean true', async () => {
    const plain = { testBoolean: true };
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toEqual(true);
  });

  it('should accept actual boolean false', async () => {
    const plain = { testBoolean: false };
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toEqual(false);
  });

  it('should return undefined if no value provided', async () => {
    const plain = {};
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toBeUndefined();
  });

  it('should return non boolean value without converting', async () => {
    const plain = {
      testBoolean: 12,
    };
    const dto = plainToInstance(TestDto, plain, {
      enableImplicitConversion: false,
    });

    expect(dto.testBoolean).toEqual(12);
  });
});
