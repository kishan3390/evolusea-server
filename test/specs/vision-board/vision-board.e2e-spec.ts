import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { v4 as uuid } from 'uuid';
import { expect } from 'vitest';
import { VisionBoardItemStatuses } from '@domain/vision-board/domain';
import { Moods } from '@domain/note/domain/enums';
import {
  WisdomStoryEntity,
  WisdomStoryTranslationEntity,
} from '@domain/wisdom-story/infrastructure/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WisdomStoryTimeToRead } from '@domain/wisdom-story/domain';
import { Languages } from '@domain/user-profile/domain';

describe('Vision board CRUD (e2e)', () => {
  let app: TestApp;
  let wisdomStoryRepository: Repository<WisdomStoryEntity>;
  let wisdomStoryTranslationRepository: Repository<WisdomStoryTranslationEntity>;

  beforeEach((context) => {
    app = context.app;
    wisdomStoryRepository = app.getProvider(
      getRepositoryToken(WisdomStoryEntity),
    );
    wisdomStoryTranslationRepository = app.getProvider(
      getRepositoryToken(WisdomStoryTranslationEntity),
    );
  });

  async function createWisdomStory({
    isFree = false,
  }: {
    isFree?: boolean;
  } = {}) {
    const storyId = uuid();
    await wisdomStoryRepository.save({
      id: storyId,
      CMSId: uuid(),
      imageUrl: 'http://example.com/image.jpg',
      timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
      mood: Moods.Calm,
      isFree,
      createdAtCMS: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      translations: [],
    });
    await wisdomStoryTranslationRepository.save({
      id: uuid(),
      wisdomStoryId: storyId,
      language: Languages.English,
      title: 'Story Title',
      content: 'Story content',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return storyId;
  }

  describe('Get user vision board', () => {
    it('given non-existing vision board, fetching it should return 404', async () => {
      const user = await app.signedInVerifiedAccount();
      const res = await user.visionBoardAPI.getVisionBoard(uuid());
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing vision board, fetching it should return board data with nested items', async () => {
      const user = await app.signedInVerifiedAccount();
      const date = new Date().toISOString().split('T')[0];
      const pathRes = await user.pathAPI.createPath({
        title: 'Nested path',
        description: 'Path description',
        date,
      });
      expect(pathRes.status).toEqual(HttpStatus.CREATED);

      const noteRes = await user.noteAPI.createNote({
        title: 'Nested note',
        description: 'Note description',
        mood: Moods.Calm,
        anonymousSharingEnabled: false,
      });
      expect(noteRes.status).toEqual(HttpStatus.CREATED);

      const wisdomStoryId = await createWisdomStory();

      const pathsIds = [pathRes.body.id];
      const notesIds = [noteRes.body.id];
      const wisdomStoriesIds = [wisdomStoryId];
      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'My board',
        description: 'My board description',
        pathsIds,
        notesIds,
        wisdomStoriesIds,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const res = await user.visionBoardAPI.getVisionBoard(createRes.body.id);
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: createRes.body.id,
          title: 'My board',
          description: 'My board description',
          pathsIds,
          notesIds,
          wisdomStoriesIds,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
      expect(res.body.paths).toEqual([
        expect.objectContaining({
          id: pathsIds[0],
          status: VisionBoardItemStatuses.Ok,
          data: expect.objectContaining({ id: pathsIds[0] }),
        }),
      ]);
      expect(res.body.notes).toEqual([
        expect.objectContaining({
          id: notesIds[0],
          status: VisionBoardItemStatuses.Ok,
          data: expect.objectContaining({ id: notesIds[0] }),
        }),
      ]);
      expect(res.body.wisdomStories).toEqual([
        expect.objectContaining({
          id: wisdomStoriesIds[0],
          status: VisionBoardItemStatuses.Ok,
          data: expect.objectContaining({ id: wisdomStoriesIds[0] }),
        }),
      ]);
    });

    it('given non-premium user and existing vision board, fetching it should mark premium items as forbidden', async () => {
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const date = new Date().toISOString().split('T')[0];
      const pathRes = await user.pathAPI.createPath({
        title: 'Free path',
        description: 'Path description',
        date,
      });
      expect(pathRes.status).toEqual(HttpStatus.CREATED);
      const noteRes = await user.noteAPI.createNote({
        title: 'Free note',
        description: 'Note description',
        mood: Moods.Calm,
        anonymousSharingEnabled: false,
      });
      expect(noteRes.status).toEqual(HttpStatus.CREATED);
      const wisdomStoryId = await createWisdomStory();

      const pathsIds = [pathRes.body.id];
      const notesIds = [noteRes.body.id];
      const wisdomStoriesIds = [wisdomStoryId];
      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'Free board',
        description: 'Free board description',
        pathsIds,
        notesIds,
        wisdomStoriesIds,
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const res = await user.visionBoardAPI.getVisionBoard(createRes.body.id);
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.body.paths).toEqual([
        expect.objectContaining({
          id: pathsIds[0],
          status: VisionBoardItemStatuses.Forbidden,
          data: null,
        }),
      ]);
      expect(res.body.notes).toEqual([
        expect.objectContaining({
          id: notesIds[0],
          status: VisionBoardItemStatuses.Ok,
          data: expect.objectContaining({ id: notesIds[0] }),
        }),
      ]);
      expect(res.body.wisdomStories).toEqual([
        expect.objectContaining({
          id: wisdomStoriesIds[0],
          status: VisionBoardItemStatuses.Forbidden,
          data: null,
        }),
      ]);
    });

    it('given existing vision board, fetching it by another user should return 404', async () => {
      const user = await app.signedInVerifiedAccount();
      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'My board',
        description: 'My board description',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const anotherUser = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const res = await anotherUser.visionBoardAPI.getVisionBoard(
        createRes.body.id,
      );
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('Create vision board', () => {
    it('given valid payload, should create new vision board with provided sections', async () => {
      const user = await app.signedInVerifiedAccount();
      const pathsIds = [uuid(), uuid()];
      const notesIds = [uuid()];
      const wisdomStoriesIds = [uuid()];

      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'Create board',
        description: 'A description for board',
        pathsIds,
        notesIds,
        wisdomStoriesIds,
      });

      expect(createRes.status).toEqual(HttpStatus.CREATED);
      expect(createRes.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'Create board',
          description: 'A description for board',
          pathsIds,
          notesIds,
          wisdomStoriesIds,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('given payload without sections, should create board with empty sections', async () => {
      const user = await app.signedInVerifiedAccount();

      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'Create board',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });

      expect(createRes.status).toEqual(HttpStatus.CREATED);
      expect(createRes.body).toEqual(
        expect.objectContaining({
          pathsIds: [],
          notesIds: [],
          wisdomStoriesIds: [],
        }),
      );
    });
  });

  describe('Update vision board', () => {
    it('given existing vision board, should update it with new data', async () => {
      const user = await app.signedInVerifiedAccount();
      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'Initial title',
        description: 'Initial description',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });

      const payload = {
        title: 'Updated title',
        description: 'Updated description',
        pathsIds: [uuid()],
        notesIds: [uuid()],
        wisdomStoriesIds: [uuid()],
      };
      const updateRes = await user.visionBoardAPI.updateVisionBoard(
        createRes.body.id,
        payload,
      );

      expect(updateRes.status).toEqual(HttpStatus.OK);
      expect(updateRes.body).toEqual(
        expect.objectContaining({
          id: createRes.body.id,
          title: 'Updated title',
          description: 'Updated description',
          pathsIds: payload.pathsIds,
          notesIds: payload.notesIds,
          wisdomStoriesIds: payload.wisdomStoriesIds,
        }),
      );
    });

    it('given vision board owned by another user, updating it should return 404', async () => {
      const user = await app.signedInVerifiedAccount();
      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'Initial title',
        description: 'Initial description',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });

      const anotherUser = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });

      const updateRes = await anotherUser.visionBoardAPI.updateVisionBoard(
        createRes.body.id,
        {
          title: 'Updated title',
          description: 'Updated description',
          pathsIds: [],
          notesIds: [],
          wisdomStoriesIds: [],
        },
      );

      expect(updateRes.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('Delete vision board', () => {
    it.for(['free', 'premium'])(
      'given %s user tier and existing vision board, deleting it should succeed',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const createRes = await user.visionBoardAPI.createVisionBoard({
          title: 'Initial title',
          description: 'Initial description',
          pathsIds: [],
          notesIds: [],
          wisdomStoriesIds: [],
        });

        const deleteRes = await user.visionBoardAPI.deleteVisionBoard(
          createRes.body.id,
        );
        expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);

        const getRes = await user.visionBoardAPI.getVisionBoard(
          createRes.body.id,
        );
        expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );
  });

  describe('List vision boards', () => {
    it.for(['free', 'premium'])(
      'given %s user tier with multiple boards, listing should return boards ordered by creation date desc',
      async ([planType]) => {
        app.overrideConfig({
          freeTierQuota: {
            visionBoardsLimit: Number.MAX_SAFE_INTEGER,
          },
        });
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        const first = await user.visionBoardAPI.createVisionBoard({
          title: 'Board 1',
          description: 'Desc 1',
          pathsIds: [],
          notesIds: [],
          wisdomStoriesIds: [],
        });
        expect(first.status).toEqual(HttpStatus.CREATED);

        const second = await user.visionBoardAPI.createVisionBoard({
          title: 'Board 2',
          description: 'Desc 2',
          pathsIds: [],
          notesIds: [],
          wisdomStoriesIds: [],
        });
        expect(second.status).toEqual(HttpStatus.CREATED);

        const third = await user.visionBoardAPI.createVisionBoard({
          title: 'Board 3',
          description: 'Desc 3',
          pathsIds: [],
          notesIds: [],
          wisdomStoriesIds: [],
        });
        expect(third.status).toEqual(HttpStatus.CREATED);

        const page1 = await user.visionBoardAPI.listVisionBoards({
          page: 1,
          perPage: 2,
        });
        expect(page1.status).toEqual(HttpStatus.OK);
        expect(page1.body.items.map((item) => item.title)).toEqual([
          'Board 3',
          'Board 2',
        ]);
        expect(page1.body.hasMore).toEqual(true);

        const page2 = await user.visionBoardAPI.listVisionBoards({
          page: 2,
          perPage: 2,
        });
        expect(page2.status).toEqual(HttpStatus.OK);
        expect(page2.body.items.map((item) => item.title)).toEqual(['Board 1']);
        expect(page2.body.hasMore).toEqual(false);
      },
    );
  });

  describe('Vision board quota', () => {
    it('given free tier user, should allow creating only one vision board and expose quota info', async () => {
      app.overrideConfig({
        freeTierQuota: {
          visionBoardsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });

      const quotaBefore = await user.visionBoardAPI.getQuota();
      expect(quotaBefore.status).toEqual(HttpStatus.OK);
      expect(quotaBefore.body).toEqual({
        create: {
          isAllowed: true,
          limit: 1,
          remaining: 1,
        },
      });

      const createRes = await user.visionBoardAPI.createVisionBoard({
        title: 'Only board',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });
      expect(createRes.status).toEqual(HttpStatus.CREATED);

      const secondCreate = await user.visionBoardAPI.createVisionBoard({
        title: 'Second board',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });
      expect(secondCreate.status).toEqual(HttpStatus.FORBIDDEN);

      const quotaAfter = await user.visionBoardAPI.getQuota();
      expect(quotaAfter.status).toEqual(HttpStatus.OK);
      expect(quotaAfter.body).toEqual({
        create: {
          isAllowed: false,
          limit: 1,
          remaining: 0,
        },
      });
    });

    it('given premium user, quota should allow unlimited boards', async () => {
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: true,
      });

      const quotaBefore = await user.visionBoardAPI.getQuota();
      expect(quotaBefore.status).toEqual(HttpStatus.OK);
      expect(quotaBefore.body).toEqual({
        create: {
          isAllowed: true,
          limit: null,
          remaining: null,
        },
      });

      await user.visionBoardAPI.createVisionBoard({
        title: 'Board 1',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });
      await user.visionBoardAPI.createVisionBoard({
        title: 'Board 2',
        pathsIds: [],
        notesIds: [],
        wisdomStoriesIds: [],
      });

      const quotaAfter = await user.visionBoardAPI.getQuota();
      expect(quotaAfter.status).toEqual(HttpStatus.OK);
      expect(quotaAfter.body).toEqual({
        create: {
          isAllowed: true,
          limit: null,
          remaining: null,
        },
      });
    });
  });
});
