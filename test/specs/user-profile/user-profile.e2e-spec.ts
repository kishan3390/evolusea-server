import { HttpStatus } from '@nestjs/common';
import { expect } from 'vitest';
import { TestApp } from '../../test-app';
import {
  BeliefSystems,
  CountryCodes,
  Languages,
} from '../../../src/domain/user-profile/domain';
import { purchaseApi, PurchaseAPI } from '../../helpers/apis/purchase-api';

describe('User profile (e2e)', () => {
  let app: TestApp;
  let purchaseAPI: PurchaseAPI;

  beforeEach((context) => {
    app = context.app;
    purchaseAPI = purchaseApi(app);
  });

  describe('Get user profile for current user', () => {
    it('given non-existing profile, fetching it should return 404', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
      });
      const res = await user.userProfileApi.getMyProfile();
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing profile for non premium user, should return profile data with non premium status', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
        premiumEntitlement: false,
      });
      const createRes = await user.userProfileApi.createMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const getRes = await user.userProfileApi.getMyProfile();
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: createRes.body.id,
          username: 'test',
          countryCode: CountryCodes.Thailand,
          belief: BeliefSystems.Christianity,
          accountId: user.id,
          language: Languages.English,
          isPremium: false,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
    });

    it('given existing profile for premium user, should return profile data with premium status', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
      });
      await purchaseAPI.setPremiumEntitlement(user.id);

      const createRes = await user.userProfileApi.createMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const getRes = await user.userProfileApi.getMyProfile();
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: createRes.body.id,
          username: 'test',
          countryCode: CountryCodes.Thailand,
          belief: BeliefSystems.Christianity,
          accountId: user.id,
          language: Languages.English,
          isPremium: true,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
    });
  });

  describe('Create user profile for current user', () => {
    it('given non-existing user profile, creating it should succeed', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
        premiumEntitlement: false,
      });
      const createRes = await user.userProfileApi.createMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      expect(createRes.body).toEqual(
        expect.objectContaining({
          id: createRes.body.id,
          username: 'test',
          countryCode: CountryCodes.Thailand,
          belief: BeliefSystems.Christianity,
          accountId: user.id,
          language: Languages.English,
          isPremium: false,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
    });

    it('given already created profile, creating it again should be impossible', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
      });
      const createRes1 = await user.userProfileApi.createMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const createRes2 = await user.userProfileApi.createMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(createRes2.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe('Update user profile for current user', () => {
    it('given non-existing profile, updating it should return 404', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
      });
      const res = await user.userProfileApi.updateMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing profile, updating it should succeed', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
        premiumEntitlement: false,
      });
      const createRes = await user.userProfileApi.createMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const updateRes = await user.userProfileApi.updateMyProfile({
        username: 'test2',
        countryCode: CountryCodes.Indonesia,
        belief: BeliefSystems.Islam,
        language: Languages.Indonesian,
      });
      expect(updateRes.status).toEqual(HttpStatus.OK);
      expect(updateRes.body).toEqual(
        expect.objectContaining({
          id: createRes.body.id,
          username: 'test2',
          countryCode: CountryCodes.Indonesia,
          belief: BeliefSystems.Islam,
          language: Languages.Indonesian,
          isPremium: false,
        }),
      );
      const getRes = await user.userProfileApi.getMyProfile();
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: createRes.body.id,
          username: 'test2',
          countryCode: CountryCodes.Indonesia,
          belief: BeliefSystems.Islam,
          language: Languages.Indonesian,
        }),
      );
    });
  });

  describe('Delete user profile for current user', () => {
    it('given non-existing profile, deleting it should return 404', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
      });
      const res = await user.userProfileApi.deleteMyProfile();
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing profile, deleting it should succeed', async () => {
      const user = await app.signedInVerifiedAccount({
        createProfile: false,
      });
      const createRes = await user.userProfileApi.createMyProfile({
        username: 'test',
        countryCode: CountryCodes.Thailand,
        belief: BeliefSystems.Christianity,
        language: Languages.English,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const deleteRes = await user.userProfileApi.deleteMyProfile();
      expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);
      expect(deleteRes.body).toEqual({});

      const getRes = await user.userProfileApi.getMyProfile();
      expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });
});
