import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { v4 as uuid } from 'uuid';
import { PathStatus } from '@domain/path/domain';
import { expect } from 'vitest';
import { Repository } from 'typeorm';
import { PathEntity } from '@domain/path/infrastructure/entities';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Path CRUD (e2e)', () => {
  let app: TestApp;
  let pathRepository: Repository<PathEntity>;

  beforeEach((context) => {
    app = context.app;
    pathRepository = app.getProvider(getRepositoryToken(PathEntity));
    app.overrideConfig({
      freeTierQuota: {
        dailyPathsLimit: Number.MAX_SAFE_INTEGER,
      },
    });
  });

  describe('Create user path', () => {
    it.for([['free'], ['premium']])(
      'given %s user tier, new path and not reached creation limit, creating it with date the day before yesterday should fail',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const date = new Date();
        date.setDate(date.getDate() - 2);
        const theDayBeforeYesterday = date.toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date: theDayBeforeYesterday,
        });
        expect(createRes.status).toEqual(HttpStatus.BAD_REQUEST);
      },
    );

    it.for([['free'], ['premium']])(
      'given %s user tier, new path and not reached creation limit, creating it with todays date should succeed',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const date = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);
        expect(createRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'test',
            description: 'test description',
            date,
            status: PathStatus.Awaiting,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );
      },
    );

    it.for([['free'], ['premium']])(
      'given %s user tier, new path with no description and not reached creation limit, creating it with todays date should succeed',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const date = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: null,
          date,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);
        expect(createRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'test',
            description: null,
            date,
            status: PathStatus.Awaiting,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );
      },
    );

    it('given premium user and paths reaching the creation limit, should not respect the free tier limit and successfully create multiple paths', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyPathsLimit: 1,
        },
      });

      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: true,
      });
      const date = new Date().toISOString().split('T')[0];
      const createRes1 = await user.pathAPI.createPath({
        title: 'test',
        description: null,
        date,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const createRes2 = await user.pathAPI.createPath({
        title: 'test',
        description: null,
        date,
      });
      expect(createRes2.status).toEqual(HttpStatus.CREATED);

      const getRes = await user.pathAPI.listPaths({ perPage: 2, page: 1 });
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          totalItems: 2,
        }),
      );
    });

    it('given free tier user and paths reaching the creation limit, should fail', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyPathsLimit: 1,
        },
      });

      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const date = new Date().toISOString().split('T')[0];
      const createRes1 = await user.pathAPI.createPath({
        title: 'test',
        description: null,
        date,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const createRes2 = await user.pathAPI.createPath({
        title: 'test',
        description: null,
        date,
      });
      expect(createRes2.status).toEqual(HttpStatus.FORBIDDEN);

      const getRes = await user.pathAPI.listPaths({ perPage: 2, page: 1 });
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          totalItems: 1,
        }),
      );
    });
  });

  describe('Get user path', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and non-existing path, fetching it should return 404',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.pathAPI.getPath(uuid());
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and existing path, fetching it should return path data',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const date = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const getRes = await user.pathAPI.getPath(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.OK);
        expect(getRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'test',
            description: 'test description',
            date,
            status: PathStatus.Awaiting,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );
      },
    );

    it.for([['premium'], ['free']])(
      'given existing path, fetching it by another user with %s user tier should return not found exception',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount();
        const date = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const getRes = await anotherUser.pathAPI.getPath(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );
  });

  describe('Delete user path', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and non-existing path, deleting it should return 404',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.pathAPI.deletePath(uuid());
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and existing path, deleting it should succeed',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const date = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const deleteRes = await user.pathAPI.deletePath(createRes.body.id);
        expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);

        const getRes = await user.pathAPI.getPath(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given existing path, deleting it should be prohibited by another user with %s user tier',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount();
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date: new Date().toISOString().split('T')[0],
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const deleteResForbidden = await anotherUser.pathAPI.deletePath(
          createRes.body.id,
        );
        expect(deleteResForbidden.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );
  });

  describe('Update user path', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and non-existing path, updating it should return 404',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const date = new Date().toISOString().split('T')[0];
        const res = await user.pathAPI.updatePath(uuid(), {
          title: 'updated title',
          description: 'updated description',
          date,
        });
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and existing path, updating it should succeed',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const today = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date: today,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateTomorrow = tomorrow.toISOString().split('T')[0];
        const updateRes = await user.pathAPI.updatePath(createRes.body.id, {
          title: 'updated title',
          description: 'updated description',
          date: dateTomorrow,
        });
        expect(updateRes.status).toEqual(HttpStatus.OK);

        const getRes = await user.pathAPI.getPath(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.OK);
        expect(getRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'updated title',
            description: 'updated description',
            date: dateTomorrow,
            status: PathStatus.Awaiting,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );
      },
    );

    it.for([['premium'], ['free']])(
      'given existing path, updating it should be prohibited by another user with %s user tier',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount();
        const date = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test',
          description: 'test description',
          date,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const updateResForbidden = await anotherUser.pathAPI.updatePath(
          createRes.body.id,
          {
            title: 'updated title',
            description: 'updated description',
            date,
          },
        );
        expect(updateResForbidden.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );
  });

  describe('List user paths', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and no paths, fetching it should return empty list',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.pathAPI.listPaths();
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body).toEqual({
          items: [],
          hasMore: false,
          totalPages: 1,
          totalItems: 0,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and 3 paths, fetching it should return paginated paths list sorted by date descendingly',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateTomorrow = tomorrow.toISOString().split('T')[0];
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dateAfterTomorrow = dayAfterTomorrow.toISOString().split('T')[0];

        const createRes1 = await user.pathAPI.createPath({
          title: 'test 1',
          description: 'test description 1',
          date: today,
        });
        expect(createRes1.status).toEqual(HttpStatus.CREATED);

        const createRes2 = await user.pathAPI.createPath({
          title: 'test 2',
          description: 'test description 2',
          date: dateTomorrow,
        });
        expect(createRes2.status).toEqual(HttpStatus.CREATED);

        const createRes3 = await user.pathAPI.createPath({
          title: 'test 3',
          description: 'test description 3',
          date: dateAfterTomorrow,
        });
        expect(createRes3.status).toEqual(HttpStatus.CREATED);

        const page1 = await user.pathAPI.listPaths({ page: 1, perPage: 2 });
        expect(page1.status).toEqual(HttpStatus.OK);
        expect(page1.body).toEqual({
          items: [
            expect.objectContaining({
              id: createRes3.body.id,
              title: 'test 3',
              description: 'test description 3',
              date: dateAfterTomorrow,
              status: PathStatus.Awaiting,
            }),
            expect.objectContaining({
              id: createRes2.body.id,
              title: 'test 2',
              description: 'test description 2',
              date: dateTomorrow,
              status: PathStatus.Awaiting,
            }),
          ],
          hasMore: true,
          totalPages: 2,
          totalItems: 3,
        });

        const page2 = await user.pathAPI.listPaths({ page: 2, perPage: 2 });
        expect(page2.status).toEqual(HttpStatus.OK);
        expect(page2.body).toEqual({
          items: [
            expect.objectContaining({
              id: createRes1.body.id,
              title: 'test 1',
              description: 'test description 1',
              date: today,
              status: PathStatus.Awaiting,
            }),
          ],
          hasMore: false,
          totalPages: 2,
          totalItems: 3,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and 5 paths created on different days with the same date, fetching it with createdFrom and createdTo filters should return paginated filtered paths list sorted by date descendingly',
      async ([planType]) => {
        const dayInMs = 24 * 60 * 60 * 1000;

        const today = new Date();
        const yesterday = new Date(today.getTime() - dayInMs);
        const twoDaysAgo = new Date(today.getTime() - 2 * dayInMs);
        const threeDaysAgo = new Date(today.getTime() - 3 * dayInMs);
        const fourDaysAgo = new Date(today.getTime() - 4 * dayInMs);

        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        const [
          fourDaysAgoRes,
          threeDaysAgoRes,
          twoDaysAgoRes,
          yesterdayRes,
          todayRes,
        ] = await Promise.all(
          [fourDaysAgo, threeDaysAgo, twoDaysAgo, yesterday, today].map(
            async (date, index) => {
              const createRes = await user.pathAPI.createPath({
                title: `test ${index}`,
                description: `test description ${index}`,
                date: today.toISOString().split('T')[0],
              });
              expect(createRes.status).toEqual(HttpStatus.CREATED);
              await pathRepository.update(createRes.body.id, {
                createdAt: date,
                updatedAt: date,
              });

              return createRes;
            },
          ),
        );

        const createdFromFilter = threeDaysAgo.toISOString();
        const createdToFilter = yesterday.toISOString();
        const page1 = await user.pathAPI.listPaths({
          page: 1,
          perPage: 2,
          createdFrom: createdFromFilter,
          createdTo: createdToFilter,
        });
        expect(page1.status).toEqual(HttpStatus.OK);
        expect(page1.body).toEqual({
          items: [
            expect.objectContaining({
              id: yesterdayRes.body.id,
              title: yesterdayRes.body.title,
              description: yesterdayRes.body.description,
              date: yesterdayRes.body.date,
              status: yesterdayRes.body.status,
            }),
            expect.objectContaining({
              id: twoDaysAgoRes.body.id,
              title: twoDaysAgoRes.body.title,
              description: twoDaysAgoRes.body.description,
              date: twoDaysAgoRes.body.date,
              status: twoDaysAgoRes.body.status,
            }),
          ],
          hasMore: true,
          totalPages: 2,
          totalItems: 3,
        });

        const page2 = await user.pathAPI.listPaths({
          page: 2,
          perPage: 2,
          createdFrom: createdFromFilter,
          createdTo: createdToFilter,
        });
        expect(page2.status).toEqual(HttpStatus.OK);
        expect(page2.body).toEqual({
          items: [
            expect.objectContaining({
              id: threeDaysAgoRes.body.id,
              title: threeDaysAgoRes.body.title,
              description: threeDaysAgoRes.body.description,
              date: threeDaysAgoRes.body.date,
              status: threeDaysAgoRes.body.status,
            }),
          ],
          hasMore: false,
          totalPages: 2,
          totalItems: 3,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and 5 paths with different dates created on same day, fetching it with dateFrom and dateTo filters should return paginated filtered paths list sorted by date descendingly',
      async ([planType]) => {
        const dayInMs = 24 * 60 * 60 * 1000;

        const today = new Date();
        const tomorrow = new Date(today.getTime() + dayInMs);
        const oneDayAfterTomorrow = new Date(today.getTime() + 2 * dayInMs);
        const twoDaysAfterTomorrow = new Date(today.getTime() + 3 * dayInMs);
        const threeDaysAfterTomorrow = new Date(today.getTime() + 4 * dayInMs);

        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        const [
          todayRes,
          tomorrowRes,
          oneDayAfterTomorrowRes,
          twoDaysAfterTomorrowRes,
          threeDaysAfterTomorrowRes,
        ] = await Promise.all(
          [
            today,
            tomorrow,
            oneDayAfterTomorrow,
            twoDaysAfterTomorrow,
            threeDaysAfterTomorrow,
          ].map(async (date, index) => {
            const createRes = await user.pathAPI.createPath({
              title: `test ${index}`,
              description: `test description ${index}`,
              date: date.toISOString().split('T')[0],
            });
            expect(createRes.status).toEqual(HttpStatus.CREATED);

            return createRes;
          }),
        );

        const dateFromFilter = tomorrow.toISOString().split('T')[0];
        const dateToFilter = twoDaysAfterTomorrow.toISOString().split('T')[0];
        const page1 = await user.pathAPI.listPaths({
          page: 1,
          perPage: 2,
          dateFrom: dateFromFilter,
          dateTo: dateToFilter,
        });
        expect(page1.status).toEqual(HttpStatus.OK);
        expect(page1.body).toEqual({
          items: [
            expect.objectContaining({
              id: twoDaysAfterTomorrowRes.body.id,
              title: twoDaysAfterTomorrowRes.body.title,
              description: twoDaysAfterTomorrowRes.body.description,
              date: twoDaysAfterTomorrowRes.body.date,
              status: twoDaysAfterTomorrowRes.body.status,
            }),
            expect.objectContaining({
              id: oneDayAfterTomorrowRes.body.id,
              title: oneDayAfterTomorrowRes.body.title,
              description: oneDayAfterTomorrowRes.body.description,
              date: oneDayAfterTomorrowRes.body.date,
              status: oneDayAfterTomorrowRes.body.status,
            }),
          ],
          hasMore: true,
          totalPages: 2,
          totalItems: 3,
        });

        const page2 = await user.pathAPI.listPaths({
          page: 2,
          perPage: 2,
          dateFrom: dateFromFilter,
          dateTo: dateToFilter,
        });
        expect(page2.status).toEqual(HttpStatus.OK);
        expect(page2.body).toEqual({
          items: [
            expect.objectContaining({
              id: tomorrowRes.body.id,
              title: tomorrowRes.body.title,
              description: tomorrowRes.body.description,
              date: tomorrowRes.body.date,
              status: tomorrowRes.body.status,
            }),
          ],
          hasMore: false,
          totalPages: 2,
          totalItems: 3,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and 3 paths for one date, fetching it should return paginated paths list sorted by date and createdAt descendingly',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        const today = new Date().toISOString().split('T')[0];
        const createRes1 = await user.pathAPI.createPath({
          title: 'test 1',
          description: 'test description 1',
          date: today,
        });
        expect(createRes1.status).toEqual(HttpStatus.CREATED);
        const createRes2 = await user.pathAPI.createPath({
          title: 'test 2',
          description: 'test description 2',
          date: today,
        });
        expect(createRes2.status).toEqual(HttpStatus.CREATED);
        const createRes3 = await user.pathAPI.createPath({
          title: 'test 3',
          description: 'test description 3',
          date: today,
        });
        expect(createRes3.status).toEqual(HttpStatus.CREATED);

        const page1 = await user.pathAPI.listPaths({ page: 1, perPage: 2 });
        expect(page1.status).toEqual(HttpStatus.OK);
        expect(page1.body).toEqual({
          items: [
            expect.objectContaining({
              id: createRes3.body.id,
              title: 'test 3',
              description: 'test description 3',
              date: today,
              status: PathStatus.Awaiting,
            }),
            expect.objectContaining({
              id: createRes2.body.id,
              title: 'test 2',
              description: 'test description 2',
              date: today,
              status: PathStatus.Awaiting,
            }),
          ],
          hasMore: true,
          totalPages: 2,
          totalItems: 3,
        });

        const page2 = await user.pathAPI.listPaths({ page: 2, perPage: 2 });
        expect(page2.status).toEqual(HttpStatus.OK);
        expect(page2.body).toEqual({
          items: [
            expect.objectContaining({
              id: createRes1.body.id,
              title: 'test 1',
              description: 'test description 1',
              date: today,
              status: PathStatus.Awaiting,
            }),
          ],
          hasMore: false,
          totalPages: 2,
          totalItems: 3,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given user with one note, listing it by user with %s user tier should be possible only for its owner',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount();
        const today = new Date().toISOString().split('T')[0];
        const createRes = await user.pathAPI.createPath({
          title: 'test 1',
          description: 'test description 1',
          date: today,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await anotherUser.pathAPI.listPaths();
        expect(res.status).toEqual(HttpStatus.OK);
        expect(res.body).toEqual({
          items: [],
          hasMore: false,
          totalPages: 1,
          totalItems: 0,
        });
      },
    );
  });

  describe('Get user paths quota', () => {
    it('given free tier user, should return quota allowing to create paths until reaching limit', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyPathsLimit: 2,
        },
      });

      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });

      const getRes1 = await user.pathAPI.getPathsQuota();
      expect(getRes1.status).toEqual(HttpStatus.OK);
      expect(getRes1.body.create).toEqual({
        isAllowed: true,
        limit: 2,
        remaining: 2,
      });

      const date1 = new Date().toISOString().split('T')[0];
      const createRes1 = await user.pathAPI.createPath({
        title: 'test',
        description: 'test description',
        date: date1,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const getRes2 = await user.pathAPI.getPathsQuota();
      expect(getRes2.status).toEqual(HttpStatus.OK);
      expect(getRes2.body.create).toEqual({
        isAllowed: true,
        limit: 2,
        remaining: 1,
      });

      const date2 = new Date().toISOString().split('T')[0];
      const createRes2 = await user.pathAPI.createPath({
        title: 'test',
        description: 'test description',
        date: date2,
      });
      expect(createRes2.status).toEqual(HttpStatus.CREATED);

      const getRes3 = await user.pathAPI.getPathsQuota();
      expect(getRes3.status).toEqual(HttpStatus.OK);
      expect(getRes3.body.create).toEqual({
        isAllowed: false,
        limit: 2,
        remaining: 0,
      });
    });

    it('given premium tier user, should return quota allowing to create unlimited paths', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyPathsLimit: 1,
        },
      });

      const user = await app.signedInVerifiedAccount();

      const getRes1 = await user.pathAPI.getPathsQuota();
      expect(getRes1.status).toEqual(HttpStatus.OK);
      expect(getRes1.body.create).toEqual({
        isAllowed: true,
        limit: null,
        remaining: null,
      });

      const date1 = new Date().toISOString().split('T')[0];
      const createRes1 = await user.pathAPI.createPath({
        title: 'test',
        description: 'test description',
        date: date1,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const getRes2 = await user.pathAPI.getPathsQuota();
      expect(getRes2.status).toEqual(HttpStatus.OK);
      expect(getRes2.body.create).toEqual({
        isAllowed: true,
        limit: null,
        remaining: null,
      });

      const date2 = new Date().toISOString().split('T')[0];
      const createRes2 = await user.pathAPI.createPath({
        title: 'test',
        description: 'test description',
        date: date2,
      });
      expect(createRes2.status).toEqual(HttpStatus.CREATED);

      const getRes3 = await user.pathAPI.getPathsQuota();
      expect(getRes3.status).toEqual(HttpStatus.OK);
      expect(getRes3.body.create).toEqual({
        isAllowed: true,
        limit: null,
        remaining: null,
      });
    });
  });
});
