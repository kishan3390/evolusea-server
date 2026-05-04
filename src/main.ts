import './sentry/instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
import { ConfigProvider } from './config/config';
import { initSwagger } from './swagger';
import { initLogger, LoggerType } from './logger';
import { BodyPromptMarkupSanitizerInterceptor } from './http-app/interceptors/body-prompt-injection-sanitizer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await initSwagger(app, ConfigProvider.swagger);
  initLogger(LoggerType.WINSTON, ConfigProvider.logger);

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new BodyPromptMarkupSanitizerInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: true,
    }),
  );

  await app.listen(3000);
}
bootstrap().catch((error) => {
  console.error('Bootstrap failed', error);
  process.exit(1);
});
