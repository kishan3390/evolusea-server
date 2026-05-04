import { INestApplication, Type } from '@nestjs/common';
import request from 'supertest';
import { FakeAuthProvider } from '../../src/http-app/authentication/fake-auth-provider';
import { AuthProvider } from '../../src/http-app/authentication';
import { SignedInAccount } from './account/signed-in-account';
import { TestAccountFactory } from './account/test-account-factory';
import {
  BeliefSystems,
  CountryCodes,
  Languages,
} from '../../src/domain/user-profile/domain';
import { v4 as uuid } from 'uuid';
import { EventEmitter, FakeEventEmitter } from '../../src/event-emitter';
import { AiFakeFacade } from '../../src/ai/ai-fake.facade';
import { AiFacade } from '../../src/ai';
import { purchaseApi } from '../helpers/apis/purchase-api';
import { IConfig } from '@config';
import { merge } from 'lodash';
import { DeepPartial } from 'typeorm';

export class TestApp {
  constructor(
    protected readonly app: INestApplication,
    private readonly config: IConfig,
  ) {}

  getHttpServer(): any {
    return this.app.getHttpServer();
  }

  async close() {
    await this.app.close();
  }

  supertestRequest() {
    return request(this.app.getHttpServer());
  }

  async signedInVerifiedAccount(
    options: {
      syncAuth?: boolean;
      createProfile?: boolean;
      premiumEntitlement?: boolean;
    } = {},
  ): Promise<SignedInAccount> {
    const {
      syncAuth = true,
      createProfile = true,
      premiumEntitlement = true,
    } = options;

    const account = new TestAccountFactory(this).createVerifiedAccount();
    if (syncAuth) {
      await account.syncAuth();
    }
    if (createProfile) {
      await account.userProfileApi.createMyProfile({
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.ThaiBuddhism,
        username: `testuser_${uuid().substring(0, 8)}`,
        language: Languages.English,
      });
    }
    if (premiumEntitlement) {
      await purchaseApi(this).setPremiumEntitlement(account.id);
    }
    return account;
  }

  overrideConfig(data: DeepPartial<IConfig>): void {
    merge(this.config, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  getProvider<T>(type: Type<T> | symbol | string | Function): T {
    return this.app.get(type);
  }

  get eventEmitter() {
    return this.app.get<FakeEventEmitter>(EventEmitter);
  }

  get aiFacade() {
    return this.app.get<AiFakeFacade>(AiFacade);
  }

  get authProvider() {
    return this.app.get<FakeAuthProvider>(AuthProvider);
  }
}
