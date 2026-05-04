import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { CompassPersonalities, Goals } from '@domain/compass/domain';

describe('Compass Config CRUD (e2e)', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  describe('Get compass config', () => {
    it('given non-existing compass config, fetching it should return not found', async () => {
      const user = await app.signedInVerifiedAccount();
      const res = await user.compassConfigAPI.getCompassConfig();
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing compass-config, fetching it should return data', async () => {
      const user = await app.signedInVerifiedAccount();
      const createRes = await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const getRes = await user.compassConfigAPI.getCompassConfig();
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          goal: Goals.Growth,
          personality: CompassPersonalities.Care,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
    });
  });

  describe('Create compass config', () => {
    it('given compass config when one already exist, creating it should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const createRes = await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      expect(createRes.status).toEqual(HttpStatus.CONFLICT);

      const getRes = await user.compassConfigAPI.getCompassConfig();
      expect(getRes.status).toEqual(HttpStatus.OK);
    });

    it('given new compass config, creating it should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      const createRes = await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);
      expect(createRes.body).toEqual(
        expect.objectContaining({
          goal: Goals.Growth,
          personality: CompassPersonalities.Care,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );

      const getRes = await user.compassConfigAPI.getCompassConfig();
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          goal: Goals.Growth,
          personality: CompassPersonalities.Care,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
    });
  });

  describe('Update compass config', () => {
    it('given non-existing compass config, updating it should return not found', async () => {
      const user = await app.signedInVerifiedAccount();
      const res = await user.compassConfigAPI.updateCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing compass config, updating it should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const res = await user.compassConfigAPI.updateCompassConfig({
        goal: Goals.Peace,
        personality: CompassPersonalities.Support,
      });
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          goal: Goals.Peace,
          personality: CompassPersonalities.Support,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );

      const getRes = await user.compassConfigAPI.getCompassConfig();
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          goal: Goals.Peace,
          personality: CompassPersonalities.Support,
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
    });
  });
});
