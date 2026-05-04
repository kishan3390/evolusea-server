import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { v4 as uuid } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { expect } from 'vitest';
import { CalendarEventEntity } from '@domain/calendar/infrastructure/entities/calendar-event.entity';
import { CalendarEventTranslationEntity } from '@domain/calendar/infrastructure/entities/calendar-event-translation.entity';
import { BeliefSystems } from '@domain/user-profile/domain';

describe('Calendar CRUD (e2e)', () => {
  let app: TestApp;
  let calendarEventRepository: Repository<CalendarEventEntity>;
  let calendarEventTranslationRepository: Repository<CalendarEventTranslationEntity>;

  beforeEach((context) => {
    app = context.app;
    calendarEventRepository = app.getProvider(
      getRepositoryToken(CalendarEventEntity),
    );
    calendarEventTranslationRepository = app.getProvider(
      getRepositoryToken(CalendarEventTranslationEntity),
    );
  });

  describe('Get calendar event', () => {
    it('given non existing calendar event, fetching it should return 404', async () => {
      const user = await app.signedInVerifiedAccount();
      const res = await user.calendarAPI.getCalendarEvent('2025-01-11');
      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing calendar event with non user belief, fetching it should return 404', async () => {
      const user = await app.signedInVerifiedAccount();
      const userProfile = await user.userProfileApi.getMyProfile();
      const calendarEvent = Object.assign(new CalendarEventEntity(), {
        id: uuid(),
        date: '2025-11-01',
        belief: BeliefSystems.Other,
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

      const getRes = await user.calendarAPI.getCalendarEvent(
        calendarEvent.date,
      );
      expect(getRes.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('given existing calendar event, fetching it should return calendar event data', async () => {
      const user = await app.signedInVerifiedAccount();
      const userProfile = await user.userProfileApi.getMyProfile();
      const calendarEvent = Object.assign(new CalendarEventEntity(), {
        id: uuid(),
        date: '2025-11-01',
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

      const getRes = await user.calendarAPI.getCalendarEvent(
        calendarEvent.date,
      );
      expect(getRes.status).toEqual(HttpStatus.OK);
      expect(getRes.body).toEqual({
        id: calendarEvent.id,
        name: translation.name,
        description: translation.description,
        language: translation.language,
        belief: calendarEvent.belief,
        date: calendarEvent.date,
        updatedAt: calendarEvent.updatedAt.toISOString(),
        createdAt: calendarEvent.createdAt.toISOString(),
      });
    });
  });
});
