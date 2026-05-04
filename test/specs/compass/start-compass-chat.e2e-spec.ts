import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import {
  CompassChatSpeaker,
  CompassChatStatus,
  CompassIntentions,
  CompassPersonalities,
  CompassTopics,
  Goals,
} from '@domain/compass/domain';
import { beforeAll, beforeEach, expect } from 'vitest';
import { v4 as uuid } from 'uuid';
import { Moods } from '@domain/note/domain/enums';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteSummaryEntity } from '@domain/note/infrastructure/entities/note-summary.entity';
import { AiToolTypes } from '../../../src/ai';
import { CalendarEventEntity } from '@domain/calendar/infrastructure/entities/calendar-event.entity';
import { CalendarEventTranslationEntity } from '@domain/calendar/infrastructure/entities/calendar-event-translation.entity';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';

const buildCalendarEventEntity = ({
  belief,
  language,
  date,
  name,
  description,
}: {
  belief: BeliefSystems;
  language: Languages;
  date: string;
  name: string;
  description: string;
}): { calendarEvent: CalendarEventEntity; translation: CalendarEventTranslationEntity } => {
  const calendarEvent = Object.assign(new CalendarEventEntity(), {
    id: uuid(),
    date,
    belief,
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies CalendarEventEntity);
  const translation = Object.assign(new CalendarEventTranslationEntity(), {
    id: uuid(),
    calendarEventId: calendarEvent.id,
    language,
    name,
    description,
    createdAt: calendarEvent.createdAt,
    updatedAt: calendarEvent.updatedAt,
  } satisfies CalendarEventTranslationEntity);
  return { calendarEvent, translation };
};

describe('Start compass chat (e2e)', () => {
  let app: TestApp;
  let noteSummaryRepository: Repository<NoteSummaryEntity>;
  let calendarEventRepository: Repository<CalendarEventEntity>;
  let calendarEventTranslationRepository: Repository<CalendarEventTranslationEntity>;
  let nowString: string;

  beforeAll(() => {
    nowString = new Date().toISOString().split('T')[0];
  });

  beforeEach((context) => {
    app = context.app;
    noteSummaryRepository = app.getProvider(
      getRepositoryToken(NoteSummaryEntity),
    );
    calendarEventRepository = app.getProvider(
      getRepositoryToken(CalendarEventEntity),
    );
    calendarEventTranslationRepository = app.getProvider(
      getRepositoryToken(CalendarEventTranslationEntity),
    );
    app.overrideConfig({
      freeTierQuota: {
        dailyCompassChatsLimit: Number.MAX_SAFE_INTEGER,
      },
    });
  });

  describe('Start from open question', () => {
    it('given compass chat start when no compass config exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.OpenQuestion,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('given compass chat start when compass config exist, starting should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      const userProfile = await user.userProfileApi.getMyProfile();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.OpenQuestion,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.OK);
      expect(startChatRes.body).toEqual({
        id: expect.any(String),
        userProfileId: userProfile.body.id,
        intention: CompassIntentions.Awareness,
        topic: CompassTopics.OpenQuestion,
        status: CompassChatStatus.Active,
        activeSpeaker: CompassChatSpeaker.User,
        turnsCount: 1,
        messages: [
          {
            compassChatId: expect.any(String),
            content: expect.any(String),
            createdAt: expect.any(String),
            id: expect.any(String),
            speaker: CompassChatSpeaker.System,
            updatedAt: expect.any(String),
            turnIndex: 1,
            metadata: null,
          },
        ],
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(app.aiFacade.lastGenerateCall).toEqual({
        model: undefined,
        provider: undefined,
        reasoning: 'medium',
        toolSelectionMode: undefined,
        temperature: 0.75,
        maxTokens: 1500,
        messages: [
          {
            content: expect.any(String),
            role: CompassChatSpeaker.System,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
        ],
        tools: [
          {
            type: AiToolTypes.Function,
            function: {
              description: expect.any(String),
              name: 'close_compass_chat',
              parameters: expect.any(Object),
            },
          },
        ],
        tracking: {
          chatId: expect.any(String),
          feature: 'compass-chat',
          userId: expect.any(String),
        },
      });

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);

      const compassChatMessages =
        await user.compassChatMessageAPI.listCompassChatMessages(
          startChatRes.body.id,
        );
      expect(compassChatMessages.body.totalItems).toEqual(1);
    });

    it('given free tier user and compass chats reaching the limit, starting should fail', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });

      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.OpenQuestion,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.OpenQuestion,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.FORBIDDEN);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);
    });

    it('given premium tier user and compass chats reaching the limit, starting should succeed without restricting to the limit', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.OpenQuestion,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.OpenQuestion,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.OK);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(2);
    });
  });

  describe('Start from path item', () => {
    it('given compass chat start when no compass config exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      const { body: path } = await user.pathAPI.createPath({
        date: '2025-11-06T19:19:34.898Z',
        title: 'Test title',
        description: 'Test description',
      });

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PathItem,
          pathId: path.id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('given compass chat start when no path item exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PathItem,
          pathId: uuid(),
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given compass chat start when compass config and path item exist, starting should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      const { body: path } = await user.pathAPI.createPath({
        date: new Date().toISOString(),
        title: 'Test title',
        description: 'Test description',
      });
      const userProfile = await user.userProfileApi.getMyProfile();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PathItem,
          pathId: path.id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.OK);
      expect(startChatRes.body).toEqual({
        id: expect.any(String),
        userProfileId: userProfile.body.id,
        intention: CompassIntentions.Awareness,
        topic: CompassTopics.PathItem,
        status: CompassChatStatus.Active,
        activeSpeaker: CompassChatSpeaker.User,
        turnsCount: 1,
        messages: [
          {
            compassChatId: expect.any(String),
            content: expect.any(String),
            createdAt: expect.any(String),
            id: expect.any(String),
            speaker: CompassChatSpeaker.System,
            updatedAt: expect.any(String),
            turnIndex: 1,
            metadata: null,
          },
        ],
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(app.aiFacade.lastGenerateCall).toEqual({
        model: undefined,
        provider: undefined,
        reasoning: 'medium',
        toolSelectionMode: undefined,
        temperature: 0.75,
        maxTokens: 1500,
        messages: [
          {
            content: expect.any(String),
            role: CompassChatSpeaker.System,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
        ],
        tools: [
          {
            type: AiToolTypes.Function,
            function: {
              description: expect.any(String),
              name: 'close_compass_chat',
              parameters: expect.any(Object),
            },
          },
        ],
        tracking: {
          chatId: expect.any(String),
          feature: 'compass-chat',
          userId: expect.any(String),
        },
      });

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);

      const compassChatMessages =
        await user.compassChatMessageAPI.listCompassChatMessages(
          startChatRes.body.id,
        );
      expect(compassChatMessages.body.totalItems).toEqual(1);
    });

    it('given free tier user and compass chats reaching the limit, starting should fail', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const { body: path } = await user.pathAPI.createPath({
        date: new Date().toISOString(),
        title: 'Test title',
        description: 'Test description',
      });
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PathItem,
          pathId: path.id,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PathItem,
          pathId: path.id,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.FORBIDDEN);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);
    });

    it('given premium tier user and compass chats reaching the limit, starting should succeed without restricting to the limit', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount();
      const { body: path } = await user.pathAPI.createPath({
        date: new Date().toISOString(),
        title: 'Test title',
        description: 'Test description',
      });
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PathItem,
          pathId: path.id,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PathItem,
          pathId: path.id,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.OK);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(2);
    });
  });

  describe('Start from personal note', () => {
    it('given compass chat start when no compass config exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      const { body: note } = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('given compass chat start when no personal note exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: uuid(),
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given compass chat start when no personal note summary exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { body: note } = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.CONFLICT);
    });

    it('given compass chat start when compass config and personal note summary exist, starting should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      const userProfile = await user.userProfileApi.getMyProfile();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { body: note } = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      const noteSummary: NoteSummaryEntity = {
        id: uuid(),
        noteId: note.id,
        content: 'Test note summary',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await noteSummaryRepository.save(
        Object.assign(new NoteSummaryEntity(), noteSummary),
      );

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.OK);
      expect(startChatRes.body).toEqual({
        id: expect.any(String),
        userProfileId: userProfile.body.id,
        intention: CompassIntentions.Awareness,
        topic: CompassTopics.PersonalNote,
        status: CompassChatStatus.Active,
        activeSpeaker: CompassChatSpeaker.User,
        turnsCount: 1,
        messages: [
          {
            compassChatId: expect.any(String),
            content: expect.any(String),
            createdAt: expect.any(String),
            id: expect.any(String),
            speaker: CompassChatSpeaker.System,
            updatedAt: expect.any(String),
            turnIndex: 1,
            metadata: null,
          },
        ],
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(app.aiFacade.lastGenerateCall).toEqual({
        model: undefined,
        provider: undefined,
        reasoning: 'medium',
        toolSelectionMode: undefined,
        temperature: 0.75,
        maxTokens: 1500,
        messages: [
          {
            content: expect.any(String),
            role: CompassChatSpeaker.System,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
        ],
        tools: [
          {
            type: AiToolTypes.Function,
            function: {
              description: expect.any(String),
              name: 'close_compass_chat',
              parameters: expect.any(Object),
            },
          },
        ],
        tracking: {
          chatId: expect.any(String),
          feature: 'compass-chat',
          userId: expect.any(String),
        },
      });

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);

      const compassChatMessages =
        await user.compassChatMessageAPI.listCompassChatMessages(
          startChatRes.body.id,
        );
      expect(compassChatMessages.body.totalItems).toEqual(1);
    });

    it('given compass chat start when compass config and personal note summary exist, starting it by another user should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { body: note } = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      const noteSummary: NoteSummaryEntity = {
        id: uuid(),
        noteId: note.id,
        content: 'Test note summary',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await noteSummaryRepository.save(
        Object.assign(new NoteSummaryEntity(), noteSummary),
      );

      const anotherUser = await app.signedInVerifiedAccount();
      await anotherUser.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const startChatRes = await anotherUser.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.NOT_FOUND);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(0);
    });

    it('given free tier user and compass chats reaching the limit, starting should fail', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { body: note } = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      const noteSummary: NoteSummaryEntity = {
        id: uuid(),
        noteId: note.id,
        content: 'Test note summary',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await noteSummaryRepository.save(
        Object.assign(new NoteSummaryEntity(), noteSummary),
      );

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.FORBIDDEN);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);
    });

    it('given premium tier user and compass chats reaching the limit, starting should succeed without restricting to the limit', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { body: note } = await user.noteAPI.createNote({
        title: 'test',
        description: 'test description',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });
      const noteSummary: NoteSummaryEntity = {
        id: uuid(),
        noteId: note.id,
        content: 'Test note summary',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await noteSummaryRepository.save(
        Object.assign(new NoteSummaryEntity(), noteSummary),
      );

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.PersonalNote,
          noteId: note.id,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.OK);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(2);
    });
  });

  describe('Start from calendar event', () => {
    it('given compass chat start when no compass config exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      const { calendarEvent, translation } = buildCalendarEventEntity({
        belief: BeliefSystems.Christianity,
        language: Languages.English,
        date: '2025-11-01',
        name: 'Test Event',
        description: 'We are celebrating important testing day',
      });
      await calendarEventRepository.save(calendarEvent);
      await calendarEventTranslationRepository.save(translation);
      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.CalendarEvent,
          date: calendarEvent.date,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('given compass chat start when no calendar event exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.CalendarEvent,
          date: '2025-11-01',
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given compass chat start when compass config and calendar event exist, starting should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      const userProfile = await user.userProfileApi.getMyProfile();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { calendarEvent, translation } = buildCalendarEventEntity({
        belief: userProfile.body.belief,
        language: userProfile.body.language,
        date: '2025-11-01',
        name: 'Test Event',
        description: 'We are celebrating important testing day',
      });
      await calendarEventRepository.save(calendarEvent);
      await calendarEventTranslationRepository.save(translation);

      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.CalendarEvent,
          date: calendarEvent.date,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.OK);
      expect(startChatRes.body).toEqual({
        id: expect.any(String),
        userProfileId: userProfile.body.id,
        intention: CompassIntentions.Awareness,
        topic: CompassTopics.CalendarEvent,
        status: CompassChatStatus.Active,
        activeSpeaker: CompassChatSpeaker.User,
        turnsCount: 1,
        messages: [
          {
            compassChatId: expect.any(String),
            content: expect.any(String),
            createdAt: expect.any(String),
            id: expect.any(String),
            speaker: CompassChatSpeaker.System,
            updatedAt: expect.any(String),
            turnIndex: 1,
            metadata: null,
          },
        ],
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(app.aiFacade.lastGenerateCall).toEqual({
        model: undefined,
        provider: undefined,
        reasoning: 'medium',
        toolSelectionMode: undefined,
        temperature: 0.75,
        maxTokens: 1500,
        messages: [
          {
            content: expect.any(String),
            role: CompassChatSpeaker.System,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
        ],
        tools: [
          {
            type: AiToolTypes.Function,
            function: {
              description: expect.any(String),
              name: 'close_compass_chat',
              parameters: expect.any(Object),
            },
          },
        ],
        tracking: {
          chatId: expect.any(String),
          feature: 'compass-chat',
          userId: expect.any(String),
        },
      });

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);

      const compassChatMessages =
        await user.compassChatMessageAPI.listCompassChatMessages(
          startChatRes.body.id,
        );
      expect(compassChatMessages.body.totalItems).toEqual(1);
    });

    it('given free tier user and compass chats reaching the limit, starting should fail', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const userProfile = await user.userProfileApi.getMyProfile();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { calendarEvent, translation } = buildCalendarEventEntity({
        belief: userProfile.body.belief,
        language: userProfile.body.language,
        date: '2025-11-01',
        name: 'Test Event',
        description: 'We are celebrating important testing day',
      });
      await calendarEventRepository.save(calendarEvent);
      await calendarEventTranslationRepository.save(translation);

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.CalendarEvent,
          date: calendarEvent.date,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.CalendarEvent,
          date: calendarEvent.date,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.FORBIDDEN);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);
    });

    it('given premium tier user and compass chats reaching the limit, starting should succeed without restricting to the limit', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount();
      const userProfile = await user.userProfileApi.getMyProfile();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const { calendarEvent, translation } = buildCalendarEventEntity({
        belief: userProfile.body.belief,
        language: userProfile.body.language,
        date: '2025-11-01',
        name: 'Test Event',
        description: 'We are celebrating important testing day',
      });
      await calendarEventRepository.save(calendarEvent);
      await calendarEventTranslationRepository.save(translation);

      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.CalendarEvent,
          date: calendarEvent.date,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.CalendarEvent,
          date: calendarEvent.date,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.OK);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(2);
    });
  });

  describe('Start from quote', () => {
    it('given compass chat start when no compass config exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      // Get a quote from the pool
      const quotesResponse = await user.quoteAPI.listQuotePool({ page: 1, perPage: 1 });
      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.Quote,
          quoteId: quotesResponse.body.items[0].id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it('given compass chat start when no quote exist, starting should fail', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.Quote,
          quoteId: uuid(),
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given compass chat start when compass config and quote exist, starting should succeed', async () => {
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const userProfile = await user.userProfileApi.getMyProfile();
      // Get a quote from the pool
      const quotesResponse = await user.quoteAPI.listQuotePool({ page: 1, perPage: 1 });
      const startChatRes = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.Quote,
          quoteId: quotesResponse.body.items[0].id,
        },
      });
      expect(startChatRes.status).toEqual(HttpStatus.OK);
      expect(startChatRes.body).toEqual({
        id: expect.any(String),
        userProfileId: userProfile.body.id,
        intention: CompassIntentions.Awareness,
        topic: CompassTopics.Quote,
        status: CompassChatStatus.Active,
        activeSpeaker: CompassChatSpeaker.User,
        turnsCount: 1,
        messages: [
          {
            compassChatId: expect.any(String),
            content: expect.any(String),
            createdAt: expect.any(String),
            id: expect.any(String),
            speaker: CompassChatSpeaker.System,
            updatedAt: expect.any(String),
            turnIndex: 1,
            metadata: null,
          },
        ],
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });

      expect(app.aiFacade.lastGenerateCall).toEqual({
        model: undefined,
        provider: undefined,
        reasoning: 'medium',
        toolSelectionMode: undefined,
        temperature: 0.75,
        maxTokens: 1500,
        messages: [
          {
            content: expect.any(String),
            role: CompassChatSpeaker.System,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
          {
            content: expect.any(String),
            role: CompassChatSpeaker.User,
          },
        ],
        tools: [
          {
            type: AiToolTypes.Function,
            function: {
              description: expect.any(String),
              name: 'close_compass_chat',
              parameters: expect.any(Object),
            },
          },
        ],
        tracking: {
          chatId: expect.any(String),
          feature: 'compass-chat',
          userId: expect.any(String),
        },
      });

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);

      const compassChatMessages =
        await user.compassChatMessageAPI.listCompassChatMessages(
          startChatRes.body.id,
        );
      expect(compassChatMessages.body.totalItems).toEqual(1);
    });

    it('given free tier user and compass chats reaching the limit, starting should fail', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      // Use a premium user to get a quote from the pool (free tier cannot browse quotes)
      const premiumHelper = await app.signedInVerifiedAccount();
      const quotesResponse = await premiumHelper.quoteAPI.listQuotePool({ page: 1, perPage: 1 });

      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.Quote,
          quoteId: quotesResponse.body.items[0].id,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.Quote,
          quoteId: quotesResponse.body.items[0].id,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.FORBIDDEN);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(1);
    });

    it('given premium tier user and compass chats reaching the limit, starting should succeed without restricting to the limit', async () => {
      app.overrideConfig({
        freeTierQuota: {
          dailyCompassChatsLimit: 1,
        },
      });
      const user = await app.signedInVerifiedAccount();
      await user.compassConfigAPI.createCompassConfig({
        goal: Goals.Growth,
        personality: CompassPersonalities.Care,
      });
      // Get a quote from the pool
      const quotesResponse = await user.quoteAPI.listQuotePool({ page: 1, perPage: 1 });
      const startChatRes1 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.Quote,
          quoteId: quotesResponse.body.items[0].id,
        },
      });
      expect(startChatRes1.status).toEqual(HttpStatus.OK);

      const startChatRes2 = await user.compassChatAPI.startCompassChat({
        intention: CompassIntentions.Awareness,
        details: {
          topic: CompassTopics.Quote,
          quoteId: quotesResponse.body.items[0].id,
        },
      });
      expect(startChatRes2.status).toEqual(HttpStatus.OK);

      const { body: compassChats } =
        await user.compassChatAPI.listCompassChats();
      expect(compassChats.totalItems).toEqual(2);
    });
  });
});
