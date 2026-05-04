import { Injectable } from '@nestjs/common';
import { Pagination, QueryHandler } from '@building-blocks/application';
import { GetCompassChatStartOptionsQuery } from '@domain/compass/application';
import { CompassChatStartOptions } from '@domain/compass/domain/compass-chat-start-options';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CalendarFacade } from '@domain/calendar/calendar.facade';
import { PathFacade } from '@domain/path/path.facade';
import { NoteFacade } from '@domain/note/note.facade';
import { QuoteFacade } from '@domain/quote/quote.facade';

@Injectable()
export class GetCompassChatStartOptionsQueryHandler
  implements
    QueryHandler<GetCompassChatStartOptionsQuery, CompassChatStartOptions>
{
  constructor(
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly calendarFacade: CalendarFacade,
    private readonly pathFacade: PathFacade,
    private readonly noteFacade: NoteFacade,
    private readonly quoteFacade: QuoteFacade,
  ) {}

  async handle(
    query: GetCompassChatStartOptionsQuery,
  ): Promise<CompassChatStartOptions> {
    const calendarEvent =
      await this.calendarFacade.getByDateAndUserProfileId(query);
    const pathItemsPaginated = await this.pathFacade.listPaths({
      userProfileId: query.userProfileId,
      pagination: Pagination.from({
        page: 1,
        perPage: 1,
      }),
    });
    const personalNotesPaginated = await this.noteFacade.listNotes({
      userProfileId: query.userProfileId,
      pagination: Pagination.from({
        page: 1,
        perPage: 1,
      }),
    });

    // Quote pool is always available if seeded -- check pool has entries
    const quotePoolCheck = await this.quoteFacade.listQuotePool({
      pagination: Pagination.from({
        page: 1,
        perPage: 1,
      }),
    });

    return CompassChatStartOptions.create({
      isDailyQuoteAvailable: quotePoolCheck.totalItems > 0,
      isCalendarEventAvailable: !!calendarEvent,
      isPathItemAvailable: !!pathItemsPaginated.totalItems,
      isPersonalNoteAvailable: !!personalNotesPaginated.totalItems,
      entityIdGenerator: this.entityIdGenerator,
    });
  }
}
