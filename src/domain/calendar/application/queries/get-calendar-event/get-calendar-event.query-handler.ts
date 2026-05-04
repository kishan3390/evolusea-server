import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCalendarEventQuery } from '@domain/calendar/application';
import { CalendarEvent, CalendarEventRepository } from '@domain/calendar/domain';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';

@Injectable()
export class GetCalendarEventQueryHandler
  implements QueryHandler<GetCalendarEventQuery, CalendarEvent>
{
  constructor(
    private readonly calendarEventRepository: CalendarEventRepository,
    private readonly userProfileFacade: UserProfileFacade,
  ) {}

  async handle(query: GetCalendarEventQuery): Promise<CalendarEvent | null> {
    const userProfile = await this.userProfileFacade.getByUserProfileId(
      query.userProfileId,
    );
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    return await this.calendarEventRepository.findOneBy({
      date: query.date,
      belief: userProfile.getBelief(),
      language: userProfile.getLanguage(),
    });
  }
}
