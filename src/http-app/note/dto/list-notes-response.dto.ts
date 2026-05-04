import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../building-blocks/application';
import { NoteDto } from './note.dto';

export class ListNotesResponseDto extends PaginatedResponseDto<NoteDto> {
  @ApiProperty({ type: [NoteDto] })
  declare items: NoteDto[];
}
