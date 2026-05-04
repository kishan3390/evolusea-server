import {
  Equals,
  IsDateString,
  IsEnum,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PlaygroundNotificationType {
  Path = 'path-overdue-reminder',
  CalendarEvent = 'calendar-event-reminder',
}

abstract class SendNotificationPlaygroundDetailsBaseDto {
  @IsEnum(PlaygroundNotificationType)
  abstract type: PlaygroundNotificationType;
}

export class SendPathNotificationPlaygroundDetailsBaseDto extends SendNotificationPlaygroundDetailsBaseDto {
  @ApiProperty({ enum: [PlaygroundNotificationType.Path] })
  @Equals(PlaygroundNotificationType.Path)
  type: PlaygroundNotificationType.Path;

  @IsUUID()
  pathId: string;
}

export class SendCalendarEventNotificationPlaygroundDetailsDto extends SendNotificationPlaygroundDetailsBaseDto {
  @ApiProperty({ enum: [PlaygroundNotificationType.CalendarEvent] })
  @Equals(PlaygroundNotificationType.CalendarEvent)
  type: PlaygroundNotificationType.CalendarEvent;

  @ApiProperty()
  @IsDateString()
  date: string;
}

const subTypes = {
  [PlaygroundNotificationType.Path]:
    SendPathNotificationPlaygroundDetailsBaseDto,
  [PlaygroundNotificationType.CalendarEvent]:
    SendCalendarEventNotificationPlaygroundDetailsDto,
} as const satisfies Record<
  PlaygroundNotificationType,
  typeof SendNotificationPlaygroundDetailsBaseDto
>;

export type SendNotificationPlaygroundDetails = InstanceType<
  (typeof subTypes)[PlaygroundNotificationType]
>;

@ApiExtraModels(...Object.values(subTypes))
export class SendNotificationPlaygroundPayloadDto {
  @IsUUID()
  userProfileId: string;

  @ApiProperty({
    oneOf: Object.values(subTypes).map((subType) => ({
      $ref: getSchemaPath(subType),
    })),
  })
  @Type(() => SendNotificationPlaygroundDetailsBaseDto, {
    discriminator: {
      property: 'type' satisfies keyof SendNotificationPlaygroundDetailsBaseDto,
      subTypes: Object.entries(subTypes).map(([name, value]) => ({
        name,
        value,
      })),
    },
    keepDiscriminatorProperty: true,
  })
  @IsObject()
  @ValidateNested()
  details: SendNotificationPlaygroundDetails;
}
