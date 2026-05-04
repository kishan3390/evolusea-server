import { CompassIntentions, CompassTopics } from '@domain/compass/domain';
import {
  Equals,
  IsDateString,
  IsEnum,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

abstract class StartCompassChatPayloadDetailsBaseDto {
  @IsEnum(CompassTopics)
  abstract topic: CompassTopics;
}

export class StartCompassChatPayloadDetailsOpenQuestionDto extends StartCompassChatPayloadDetailsBaseDto {
  @ApiProperty({ enum: [CompassTopics.OpenQuestion] })
  @Equals(CompassTopics.OpenQuestion)
  topic: CompassTopics.OpenQuestion;
}

export class StartCompassChatPayloadDetailsPersonalNoteDto extends StartCompassChatPayloadDetailsBaseDto {
  @ApiProperty({ enum: [CompassTopics.PersonalNote] })
  @Equals(CompassTopics.PersonalNote)
  topic: CompassTopics.PersonalNote;

  @IsUUID()
  noteId: string;
}

export class StartCompassChatPayloadDetailsPathItemDto extends StartCompassChatPayloadDetailsBaseDto {
  @ApiProperty({ enum: [CompassTopics.PathItem] })
  @Equals(CompassTopics.PathItem)
  topic: CompassTopics.PathItem;

  @IsUUID()
  pathId: string;
}

export class StartCompassChatPayloadDetailsCalendarEventDto extends StartCompassChatPayloadDetailsBaseDto {
  @ApiProperty({ enum: [CompassTopics.CalendarEvent] })
  @Equals(CompassTopics.CalendarEvent)
  topic: CompassTopics.CalendarEvent;

  @IsDateString()
  date: string;
}

export class StartCompassChatPayloadDetailsQuoteDto extends StartCompassChatPayloadDetailsBaseDto {
  @ApiProperty({ enum: [CompassTopics.Quote] })
  @Equals(CompassTopics.Quote)
  topic: CompassTopics.Quote;

  @IsUUID()
  quoteId: string;
}

const subTypes = {
  [CompassTopics.OpenQuestion]: StartCompassChatPayloadDetailsOpenQuestionDto,
  [CompassTopics.PersonalNote]: StartCompassChatPayloadDetailsPersonalNoteDto,
  [CompassTopics.PathItem]: StartCompassChatPayloadDetailsPathItemDto,
  [CompassTopics.CalendarEvent]: StartCompassChatPayloadDetailsCalendarEventDto,
  [CompassTopics.Quote]: StartCompassChatPayloadDetailsQuoteDto,
} as const satisfies Record<
  CompassTopics,
  typeof StartCompassChatPayloadDetailsBaseDto
>;

@ApiExtraModels(...Object.values(subTypes))
export class StartCompassChatPayloadDto {
  @IsEnum(CompassIntentions)
  intention: CompassIntentions;

  @ApiProperty({
    oneOf: Object.values(subTypes).map((subType) => ({
      $ref: getSchemaPath(subType),
    })),
  })
  @Type(() => StartCompassChatPayloadDetailsBaseDto, {
    discriminator: {
      property: 'topic' satisfies keyof StartCompassChatPayloadDetailsBaseDto,
      subTypes: Object.entries(subTypes).map(([name, value]) => ({
        name,
        value,
      })),
    },
    keepDiscriminatorProperty: true,
  })
  @IsObject()
  @ValidateNested()
  details: InstanceType<(typeof subTypes)[CompassTopics]>;
}
