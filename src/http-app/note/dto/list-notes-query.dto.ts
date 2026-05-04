import { IsDateString, IsOptional } from 'class-validator';
import { PaginatedRequestDto } from '@building-blocks/application';

export class ListNotesQueryDto extends PaginatedRequestDto {
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;
}
