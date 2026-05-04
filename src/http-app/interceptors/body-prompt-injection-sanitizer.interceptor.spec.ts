import { Body, Controller, INestApplication, Post } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DisableBodyPromptInjectionSanitizer } from '../decorators/disable-prompt-injection-sanitizer.decorator';
import { BodyPromptMarkupSanitizerInterceptor } from './body-prompt-injection-sanitizer.interceptor';

class DisabledPromptDto {
  prompt: string;
}

class SanitizedPromptDto {
  message: string;
  nested: {
    items: (string | { value: string })[];
  };
}

class ErrorPromptDto {
  message: string;
}

@Controller('test')
class SanitizerTestController {
  @Post('disabled')
  @DisableBodyPromptInjectionSanitizer()
  handleDisabled(@Body() dto: DisabledPromptDto): DisabledPromptDto {
    return dto;
  }

  @Post('enabled')
  handleEnabled(@Body() dto: SanitizedPromptDto): SanitizedPromptDto {
    return dto;
  }

  @Post('error')
  handleError(@Body() dto: ErrorPromptDto): ErrorPromptDto {
    return dto;
  }
}

describe('BodyPromptMarkupSanitizerInterceptor', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SanitizerTestController],
      providers: [Reflector, BodyPromptMarkupSanitizerInterceptor],
    }).compile();

    app = moduleRef.createNestApplication();
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(
      new BodyPromptMarkupSanitizerInterceptor(reflector),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('given metadata disables sanitization it skips sanitization', async () => {
    const response = await request(app.getHttpServer())
      .post('/test/disabled')
      .send({ prompt: '<system>secret</system>' })
      .expect(201);

    expect(response.body.prompt).toBe('<system>secret</system>');
  });

  it('given prompt contains markup it sanitizes the phrases', async () => {
    const firstMatch = '<system>first</system>';
    const secondMatch = '<system level="debug">second</system>';
    const thirdMatch = '<system>third</system>';

    const response = await request(app.getHttpServer())
      .post('/test/enabled')
      .send({
        message: `prefix ${firstMatch} suffix`,
        nested: {
          items: ['clean', `${secondMatch} more`, { value: `${thirdMatch}` }],
        },
      })
      .expect(201);

    expect(response.body).toEqual({
      message: 'prefix first suffix',
      nested: {
        items: ['clean', 'second more', { value: 'third' }],
      },
    });
  });

  it('given sanitization fails it skips sanitization', async () => {
    vi.spyOn(
      BodyPromptMarkupSanitizerInterceptor.prototype as any,
      'deepSanitize',
    ).mockImplementation(() => {
      throw new Error('forced failure');
    });

    const response = await request(app.getHttpServer())
      .post('/test/error')
      .send({ message: '<system>secret</system>' })
      .expect(201);

    expect(response.body).toEqual({ message: '<system>secret</system>' });
  });
});
