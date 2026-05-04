import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { v4 as uuid } from 'uuid';
import { Moods } from '@domain/note/domain/enums';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoteSummaryEntity } from '@domain/note/infrastructure/entities/note-summary.entity';
import { NoteEntity } from '@domain/note/infrastructure/entities/note.entity';
import { Repository } from 'typeorm';
import { expect } from 'vitest';
import { AiFacade, AiRoleEnum } from '../../../src/ai';

describe('Note CRUD (e2e)', () => {
  let app: TestApp;
  let noteSummaryRepository: Repository<NoteSummaryEntity>;
  let noteRepository: Repository<NoteEntity>;
  let aiFacade: AiFacade;

  beforeEach((context) => {
    app = context.app;
    noteSummaryRepository = app.getProvider(
      getRepositoryToken(NoteSummaryEntity),
    );
    noteRepository = app.getProvider(getRepositoryToken(NoteEntity));
    aiFacade = app.getProvider(AiFacade);
    app.overrideConfig({
      freeTierQuota: {
        dailyNotesLimit: Number.MAX_SAFE_INTEGER,
      },
    });
  });

  describe('Get user note', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and non-existing note, fetching it should return 404',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.noteAPI.getNote(uuid());
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and existing note, fetching it should return note data',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: 'test description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const getRes = await user.noteAPI.getNote(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.OK);
        expect(getRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'test',
            description: 'test description',
            mood: Moods.Motivated,
            anonymousSharingEnabled: false,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );
      },
    );

    it.for(['premium', 'free'])(
      'given existing note, fetching it by another user with %s user tier should return not found exception',
      async (planType) => {
        const user = await app.signedInVerifiedAccount();
        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: 'test description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const getRes = await anotherUser.noteAPI.getNote(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );
  });

  describe('Create user note', () => {
    it.for([['free'], ['premium']])(
      'given %s user tier, new note and not reached creation limit, should successfully create note and summary',
      async ([planType]) => {
        const noteSummaryContent = 'Here is the note summary';
        vi.spyOn(aiFacade, 'generate').mockResolvedValue({
          message: { role: AiRoleEnum.Assistant, content: noteSummaryContent },
          actions: [],
        });

        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: 'test description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);
        expect(createRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'test',
            description: 'test description',
            mood: Moods.Motivated,
            anonymousSharingEnabled: false,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );

        await app.eventEmitter.waitForAll();

        const getRes = await user.noteAPI.getNote(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.OK);

        const noteSummary = await noteSummaryRepository.find({
          where: {
            noteId: createRes.body.id,
          },
        });
        expect(noteSummary).length(1);
        expect(noteSummary[0]).toEqual({
          id: expect.any(String),
          noteId: createRes.body.id,
          content: noteSummaryContent,
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date),
        });
      },
    );

    it.for([['free'], ['premium']])(
      'given %s user tier, new note with no description and not reached creation limit, should successfully create note and summary',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const noteSummaryContent = 'Here is the note summary';
        vi.spyOn(aiFacade, 'generate').mockResolvedValue({
          message: { role: AiRoleEnum.Assistant, content: noteSummaryContent },
          actions: [],
        });

        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: null,
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);
        expect(createRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'test',
            description: null,
            mood: Moods.Motivated,
            anonymousSharingEnabled: false,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );

        const getRes = await user.noteAPI.getNote(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.OK);
        expect(getRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'test',
            description: null,
            mood: Moods.Motivated,
            anonymousSharingEnabled: false,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        );

        await app.eventEmitter.waitForAll();

        const noteSummary = await noteSummaryRepository.find({
          where: {
            noteId: createRes.body.id,
          },
        });
        expect(noteSummary).length(1);
        expect(noteSummary[0]).toEqual({
          id: expect.any(String),
          noteId: createRes.body.id,
          content: noteSummaryContent,
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date),
        });
      },
    );

    it('given premium user and notes reaching the creation limit, should not respect the free tier limit and successfully create multiple notes', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyNotesLimit: 1,
        },
      });

      const noteSummaryContent = 'Here is the note summary';
      vi.spyOn(aiFacade, 'generate')
        .mockResolvedValue({
          message: { role: AiRoleEnum.Assistant, content: noteSummaryContent },
          actions: [],
        })
        .mockResolvedValue({
          message: { role: AiRoleEnum.Assistant, content: noteSummaryContent },
          actions: [],
        });

      const user = await app.signedInVerifiedAccount();
      const createRes1 = await user.noteAPI.createNote({
        title: 'test',
        description: null,
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const createRes2 = await user.noteAPI.createNote({
        title: 'test',
        description: null,
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes2.status).toEqual(HttpStatus.CREATED);

      const getRes = await user.noteAPI.listNotes({ perPage: 2, page: 1 });
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          totalItems: 2,
        }),
      );
    });

    it('given free tier user and notes reaching the creation limit, should fail', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyNotesLimit: 1,
        },
      });

      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const createRes1 = await user.noteAPI.createNote({
        title: 'test',
        description: null,
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const createRes2 = await user.noteAPI.createNote({
        title: 'test',
        description: null,
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes2.status).toEqual(HttpStatus.FORBIDDEN);

      const getRes = await user.noteAPI.listNotes({ perPage: 2, page: 1 });
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual(
        expect.objectContaining({
          totalItems: 1,
        }),
      );
    });
  });

  describe('Delete user note', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and non-existing note, deleting it should return 404',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.noteAPI.deleteNote(uuid());
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and existing note, deleting it should succeed',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: 'test description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const deleteRes = await user.noteAPI.deleteNote(createRes.body.id);
        expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);

        const getRes = await user.noteAPI.getNote(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given existing note, deleting it should be prohibited by another user with %s user tier',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount();
        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: 'test description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const deleteResForbidden = await anotherUser.noteAPI.deleteNote(
          createRes.body.id,
        );
        expect(deleteResForbidden.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );
  });

  describe('Update user note', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and non-existing note, updating it should return 404',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.noteAPI.updateNote(uuid(), {
          title: 'updated title',
          description: 'updated description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: true,
        });
        expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and existing note, should successfully update note and summary',
      async ([planType]) => {
        const oldNoteSummaryContent = 'Here is the note summary';
        const newNoteSummaryContent = 'Here is the new note summary';
        vi.spyOn(aiFacade, 'generate')
          .mockResolvedValueOnce({
            message: {
              role: AiRoleEnum.Assistant,
              content: oldNoteSummaryContent,
            },
            actions: [],
          })
          .mockResolvedValueOnce({
            message: {
              role: AiRoleEnum.Assistant,
              content: newNoteSummaryContent,
            },
            actions: [],
          });
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: 'test description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        await app.eventEmitter.waitForAll();

        const updateRes = await user.noteAPI.updateNote(createRes.body.id, {
          title: 'updated title',
          description: 'updated description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: true,
        });
        expect(updateRes.status).toEqual(HttpStatus.OK);

        await app.eventEmitter.waitForAll();

        const getRes = await user.noteAPI.getNote(createRes.body.id);
        expect(getRes.status).toEqual(HttpStatus.OK);
        expect(getRes.body).toEqual(
          expect.objectContaining({
            id: createRes.body.id,
            title: 'updated title',
            description: 'updated description',
            mood: Moods.Motivated,
            anonymousSharingEnabled: true,
          }),
        );

        const noteSummary = await noteSummaryRepository.find({
          where: {
            noteId: createRes.body.id,
          },
        });
        expect(noteSummary).length(1);
        expect(noteSummary[0]).toEqual({
          id: expect.any(String),
          noteId: createRes.body.id,
          content: newNoteSummaryContent,
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date),
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given existing note, updating it should be prohibited by another user with %s user tier',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount();
        const createRes = await user.noteAPI.createNote({
          title: 'test',
          description: 'test description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const updateResForbidden = await anotherUser.noteAPI.updateNote(
          createRes.body.id,
          {
            title: 'updated title',
            description: 'updated description',
            mood: Moods.Motivated,
            anonymousSharingEnabled: true,
          },
        );
        expect(updateResForbidden.status).toEqual(HttpStatus.NOT_FOUND);
      },
    );
  });

  describe('List user notes', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and no notes, fetching it should return empty list',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.noteAPI.listNotes();
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
      'given %s user tier and 3 notes, fetching it with no filters should return paginated notes list sorted by creation date descendingly',
      async ([planType]) => {
        app.overrideConfig({
          freeTierQuota: {
            dailyNotesLimit: 3,
          },
        });

        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const createRes1 = await user.noteAPI.createNote({
          title: 'test 1',
          description: 'test description 1',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes1.status).toEqual(HttpStatus.CREATED);

        const createRes2 = await user.noteAPI.createNote({
          title: 'test 2',
          description: 'test description 2',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes2.status).toEqual(HttpStatus.CREATED);

        const createRes3 = await user.noteAPI.createNote({
          title: 'test 3',
          description: 'test description 3',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes3.status).toEqual(HttpStatus.CREATED);

        const page1 = await user.noteAPI.listNotes({ page: 1, perPage: 2 });
        expect(page1.status).toEqual(HttpStatus.OK);
        expect(page1.body).toEqual({
          items: [
            expect.objectContaining({
              id: createRes3.body.id,
              title: 'test 3',
              description: 'test description 3',
              mood: Moods.Motivated,
              anonymousSharingEnabled: false,
            }),
            expect.objectContaining({
              id: createRes2.body.id,
              title: 'test 2',
              description: 'test description 2',
              mood: Moods.Motivated,
              anonymousSharingEnabled: false,
            }),
          ],
          hasMore: true,
          totalPages: 2,
          totalItems: 3,
        });

        const page2 = await user.noteAPI.listNotes({ page: 2, perPage: 2 });
        expect(page2.status).toEqual(HttpStatus.OK);
        expect(page2.body).toEqual({
          items: [
            expect.objectContaining({
              id: createRes1.body.id,
              title: 'test 1',
              description: 'test description 1',
              mood: Moods.Motivated,
              anonymousSharingEnabled: false,
            }),
          ],
          hasMore: false,
          totalPages: 2,
          totalItems: 3,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and 5 notes created on different days, fetching it with createdFrom and createdTo filters should return paginated filtered notes list sorted by creation date descendingly',
      async ([planType]) => {
        app.overrideConfig({
          freeTierQuota: {
            dailyNotesLimit: 5,
          },
        });

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
              const createRes = await user.noteAPI.createNote({
                title: `test ${index}`,
                description: `test description ${index}`,
                mood: Moods.Motivated,
                anonymousSharingEnabled: false,
              });
              expect(createRes.status).toEqual(HttpStatus.CREATED);
              await noteRepository.update(createRes.body.id, {
                createdAt: date,
                updatedAt: date,
              });

              return createRes;
            },
          ),
        );

        const createdFromFilter = threeDaysAgo.toISOString();
        const createdToFilter = yesterday.toISOString();
        const page1 = await user.noteAPI.listNotes({
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
              mood: yesterdayRes.body.mood,
              anonymousSharingEnabled:
                yesterdayRes.body.anonymousSharingEnabled,
            }),
            expect.objectContaining({
              id: twoDaysAgoRes.body.id,
              title: twoDaysAgoRes.body.title,
              description: twoDaysAgoRes.body.description,
              mood: twoDaysAgoRes.body.mood,
              anonymousSharingEnabled:
                twoDaysAgoRes.body.anonymousSharingEnabled,
            }),
          ],
          hasMore: true,
          totalPages: 2,
          totalItems: 3,
        });

        const page2 = await user.noteAPI.listNotes({
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
              mood: threeDaysAgoRes.body.mood,
              anonymousSharingEnabled:
                threeDaysAgoRes.body.anonymousSharingEnabled,
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
        app.overrideConfig({
          freeTierQuota: {
            dailyNotesLimit: 1,
          },
        });

        const user = await app.signedInVerifiedAccount();
        const createRes = await user.noteAPI.createNote({
          title: 'test 1',
          description: 'test description 1',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });
        expect(createRes.status).toEqual(HttpStatus.CREATED);

        const anotherUser = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await anotherUser.noteAPI.listNotes();
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

  describe('Get user notes quota', () => {
    it('given free tier user, should return quota allowing to create notes until reaching limit', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyNotesLimit: 2,
        },
      });

      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });

      const getRes1 = await user.noteAPI.getNotesQuota();
      expect(getRes1.status).toEqual(HttpStatus.OK);
      expect(getRes1.body.create).toEqual({
        isAllowed: true,
        limit: 2,
        remaining: 2,
      });

      const createRes1 = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const getRes2 = await user.noteAPI.getNotesQuota();
      expect(getRes2.status).toEqual(HttpStatus.OK);
      expect(getRes2.body.create).toEqual({
        isAllowed: true,
        limit: 2,
        remaining: 1,
      });

      const createRes2 = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes2.status).toEqual(HttpStatus.CREATED);

      const getRes3 = await user.noteAPI.getNotesQuota();
      expect(getRes3.status).toEqual(HttpStatus.OK);
      expect(getRes3.body.create).toEqual({
        isAllowed: false,
        limit: 2,
        remaining: 0,
      });
    });

    it('given premium tier user, should return quota allowing to create unlimited notes', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyNotesLimit: 1,
        },
      });

      const user = await app.signedInVerifiedAccount();

      const getRes1 = await user.noteAPI.getNotesQuota();
      expect(getRes1.status).toEqual(HttpStatus.OK);
      expect(getRes1.body.create).toEqual({
        isAllowed: true,
        limit: null,
        remaining: null,
      });

      const createRes1 = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes1.status).toEqual(HttpStatus.CREATED);

      const getRes2 = await user.noteAPI.getNotesQuota();
      expect(getRes2.status).toEqual(HttpStatus.OK);
      expect(getRes2.body.create).toEqual({
        isAllowed: true,
        limit: null,
        remaining: null,
      });

      const createRes2 = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      expect(createRes2.status).toEqual(HttpStatus.CREATED);

      const getRes3 = await user.noteAPI.getNotesQuota();
      expect(getRes3.status).toEqual(HttpStatus.OK);
      expect(getRes3.body.create).toEqual({
        isAllowed: true,
        limit: null,
        remaining: null,
      });
    });
  });
});
