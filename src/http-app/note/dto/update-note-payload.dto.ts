import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Moods } from '../../../domain/note/domain/enums';

export class UpdateNotePayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  description: string | null = null;

  @IsOptional()
  @IsEnum(Moods)
  mood?: Moods;

  @IsBoolean()
  anonymousSharingEnabled: boolean;
}
