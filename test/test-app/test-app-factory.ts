import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseModule } from '@firebase/firebase.module';
import { FirebaseAdmin } from '@firebase/firebase-admin';
import { FirebaseAuth } from '@firebase/firebase-auth';
import { TestApp } from './test-app';
import { AuthProvider } from '../../src/http-app/authentication';
import { ClearLogger } from '../../src/logger';
import { AppModule } from '../../src/app.module';
import { FakeAuthProvider } from '../../src/http-app/authentication/fake-auth-provider';
import { AiFacade } from '../../src/ai';
import { AiFakeFacade } from '../../src/ai/ai-fake.facade';
import { EventEmitter, FakeEventEmitter } from '../../src/event-emitter';
import { NotificationProvider } from '../../src/domain/notification/domain';
import { FakeNotificationProvider } from '../../src/domain/notification/infrastructure';
import { Reflector } from '@nestjs/core';
import {
  BodyPromptMarkupSanitizerInterceptor
} from '../../src/http-app/interceptors/body-prompt-injection-sanitizer.interceptor';
import { RevenueCatService } from '../../src/lib/purchase';
import { FakeRevenueCatService } from '../../src/lib/purchase/revenue-cat/fake-revenue-cat.service';
import { cloneDeep } from 'lodash';
import { ConfigProvider, IConfig } from '@config';
import { CompassChatRateLimitGuard } from '../../src/http-app/compass/guards/compass-chat-rate-limit.guard';
import { CompassChatRepetitionGuard } from '../../src/http-app/compass/guards/compass-chat-repetition.guard';

export class TestAppFactory {
  static async create(): Promise<TestApp> {
    const configCopy = cloneDeep(ConfigProvider);
    const app = await this.initApp(configCopy);

    return new TestApp(app, configCopy);
  }

  private static async initApp(config: IConfig): Promise<INestApplication<any>> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(FirebaseModule)
      .useModule({
        module: FirebaseModule,
        providers: [
          { provide: FirebaseAdmin, useValue: undefined },
          { provide: FirebaseAuth, useValue: undefined },
        ],
        exports: [FirebaseAdmin, FirebaseAuth],
      })
      .overrideProvider(AuthProvider)
      .useClass(FakeAuthProvider)
      .overrideProvider(AiFacade)
      .useClass(AiFakeFacade)
      .overrideProvider(EventEmitter)
      .useClass(FakeEventEmitter)
      .overrideProvider(NotificationProvider)
      .useClass(FakeNotificationProvider)
      .overrideProvider(RevenueCatService)
      .useClass(FakeRevenueCatService)
      .overrideGuard(CompassChatRateLimitGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CompassChatRepetitionGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(IConfig)
      .useValue(config)
      .compile();

    const app = moduleFixture.createNestApplication();

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new BodyPromptMarkupSanitizerInterceptor(reflector));

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: false,
        whitelist: true,
      }),
    );
    app.useLogger(new ClearLogger());
    await app.init();

    return app;
  }
}
