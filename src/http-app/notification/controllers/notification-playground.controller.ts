import { Body, Controller, Post } from '@nestjs/common';
import {
  PlaygroundNotificationType,
  SendNotificationPlaygroundPayloadDto,
} from '../dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PathFacade } from '@domain/path/path.facade';
import { CalendarFacade } from '@domain/calendar/calendar.facade';

@ApiTags('Playground')
@Controller('/playground')
export class NotificationPlaygroundController {
  constructor(
    private readonly pathFacade: PathFacade,
    private readonly calendarFacade: CalendarFacade,
  ) {}

  @ApiOperation({ summary: 'Available only for development env' })
  @Post('/notifications/send')
  async sendNotification(
    @Body() payload: SendNotificationPlaygroundPayloadDto,
  ): Promise<void> {
    await this.sendNotificationDispatched(payload);
  }

  private async sendNotificationDispatched(
    payload: SendNotificationPlaygroundPayloadDto,
  ) {
    switch (payload.details.type) {
      case PlaygroundNotificationType.Path:
        await this.pathFacade.sendPathNotification({
          userProfileId: payload.userProfileId,
          pathId: payload.details.pathId,
        });
        break;
      case PlaygroundNotificationType.CalendarEvent: {
        await this.calendarFacade.sendCalendarEventNotification({
          userProfileId: payload.userProfileId,
          date: payload.details.date,
        });
        break;
      }
    }
  }
}
