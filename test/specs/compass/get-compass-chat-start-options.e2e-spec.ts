import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { beforeAll, expect } from 'vitest';
import { Moods } from '@domain/note/domain/enums';
import { CalendarEventEntity } from '@domain/calendar/infrastructure/entities/calendar-event.entity';
import { CalendarEventTranslationEntity } from '@domain/calendar/infrastructure/entities/calendar-event-translation.entity';
import { v4 as uuid } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Get compass chat start options (e2e)', () => {
  let app: TestApp;
  let calendarEventRepository: Repository<CalendarEventEntity>;
  let calendarEventTranslationRepository: Repository<CalendarEventTranslationEntity>;
  let nowString: string;

  beforeAll(() => {
    nowString = new Date().toISOString().split('T')[0];
  });

  beforeEach((context) => {
    app = context.app;
    calendarEventRepository = app.getProvider(
      getRepositoryToken(CalendarEventEntity),
    );
    calendarEventTranslationRepository = app.getProvider(
      getRepositoryToken(CalendarEventTranslationEntity),
    );
  });

  it('given no personal notes, path items, or calendar events, should mark those as unavailable but daily quote as available (quote pool is seeded)', async () => {
    const user = await app.signedInVerifiedAccount();
    const res = await user.compassChatAPI.getCompassChatStartOptions({ date: nowString });
    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body).toEqual({
      isDailyQuoteAvailable: true, // Quote pool is always seeded
      isPersonalNoteAvailable: false,
      isPathItemAvailable: false,
      isCalendarEventAvailable: false,
    });
  });

  it('given personal note, should mark starting chat from note as available', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.noteAPI.createNote({
      title: 'test',
      description: 'test description',
      mood: Moods.Motivated,
      anonymousSharingEnabled: false,
    });
    const res = await user.compassChatAPI.getCompassChatStartOptions({ date: nowString });
    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body).toEqual({
      isDailyQuoteAvailable: true, // Quote pool is always seeded
      isPersonalNoteAvailable: true,
      isPathItemAvailable: false,
      isCalendarEventAvailable: false,
    });
  });

  it('given path item, should mark starting chat from path as available', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.pathAPI.createPath({
      title: 'test',
      description: 'test description',
      date: nowString,
    });
    const res = await user.compassChatAPI.getCompassChatStartOptions({ date: nowString });
    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body).toEqual({
      isDailyQuoteAvailable: true, // Quote pool is always seeded
      isPersonalNoteAvailable: false,
      isPathItemAvailable: true,
      isCalendarEventAvailable: false,
    });
  });

  it('given calendar event, should mark starting chat from event as available', async () => {
    const user = await app.signedInVerifiedAccount();
    const userProfile = await user.userProfileApi.getMyProfile();
    const calendarEvent = Object.assign(new CalendarEventEntity(), {
      id: uuid(),
      date: nowString,
      belief: userProfile.body.belief,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies CalendarEventEntity);
    await calendarEventRepository.save(calendarEvent);
    const translation = Object.assign(new CalendarEventTranslationEntity(), {
      id: uuid(),
      calendarEventId: calendarEvent.id,
      language: userProfile.body.language,
      name: 'Test Event',
      description: 'We are celebrating important testing day',
      createdAt: calendarEvent.createdAt,
      updatedAt: calendarEvent.updatedAt,
    } satisfies CalendarEventTranslationEntity);
    await calendarEventTranslationRepository.save(translation);

    const res = await user.compassChatAPI.getCompassChatStartOptions({ date: nowString });
    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body).toEqual({
      isDailyQuoteAvailable: true, // Quote pool is always seeded
      isPersonalNoteAvailable: false,
      isPathItemAvailable: false,
      isCalendarEventAvailable: true,
    });
  });

  it('given seeded quote pool, should always mark daily quote as available', async () => {
    const user = await app.signedInVerifiedAccount();

    const res = await user.compassChatAPI.getCompassChatStartOptions({ date: nowString });
    expect(res.status).toEqual(HttpStatus.OK);
    expect(res.body.isDailyQuoteAvailable).toBe(true);
  });
});
