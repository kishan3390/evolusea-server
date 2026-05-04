import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Moods } from '../../../domain/note/domain/enums';

export class CreateNotePayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(3000)
  description: string | null;

  @IsOptional()
  @IsEnum(Moods)
  mood?: Moods;

  @IsBoolean()
  anonymousSharingEnabled: boolean;
}
