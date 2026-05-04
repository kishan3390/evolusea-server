import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { CalendarEventDto } from '../../../src/http-app/calendar-events/dto';

export function calendarApi(user: SignedInAccount) {
  return {
    async getCalendarEvent(
      date: string,
    ): Promise<ApiResponse<CalendarEventDto>> {
      return await user.authenticatedRequest.get(
        `/users/me/calendar/events/${date}`,
      );
    },
  };
}

export type CalendarAPI = ReturnType<typeof calendarApi>;
