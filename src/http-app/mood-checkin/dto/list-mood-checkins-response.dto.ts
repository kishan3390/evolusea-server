import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../building-blocks/application';
import { MoodCheckinDto } from './mood-checkin.dto';

export class ListMoodCheckinsResponseDto extends PaginatedResponseDto<MoodCheckinDto> {
  @ApiProperty({ type: [MoodCheckinDto] })
  declare items: MoodCheckinDto[];
}
