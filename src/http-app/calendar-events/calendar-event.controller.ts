import { Controller, Get, NotFoundException } from '@nestjs/common';
import { CurrentUser, DateParam, RequiredAuth } from '../decorators';
import { AuthUser } from '../authentication';
import { CalendarFacade } from '@domain/calendar/calendar.facade';
import { CalendarEventDto } from './dto';

@Controller('users/me/calendar/events')
@RequiredAuth()
export class CalendarEventController {
  constructor(private readonly calendarFacade: CalendarFacade) {}

  @Get('/:date')
  async getCalendarEvent(
    @DateParam('date') date: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<CalendarEventDto> {
    const calendarEvent = await this.calendarFacade.getByDateAndUserProfileId({
      userProfileId: authUser.userProfileId,
      date,
    });
    if (!calendarEvent) {
      throw new NotFoundException('Calendar event not found');
    }
    return CalendarEventDto.fromEntity(calendarEvent);
  }
}
