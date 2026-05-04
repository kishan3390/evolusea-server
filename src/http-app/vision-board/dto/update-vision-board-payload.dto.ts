import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateVisionBoardPayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  description?: string;

  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  pathsIds: string[];

  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  notesIds: string[];

  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  wisdomStoriesIds: string[];
}
