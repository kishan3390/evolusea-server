import { IsEnum } from 'class-validator';
import { Moods } from '../../../domain/note/domain/enums';

export class CreateMoodCheckinPayloadDto {
  @IsEnum(Moods)
  mood: Moods;
}
