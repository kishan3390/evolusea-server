import {
  PaginatedRequestDto,
  PaginatedResponseDto,
} from '@building-blocks/application';
import { VisionBoardDto } from './vision-board.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ListVisionBoardsQueryDto extends PaginatedRequestDto {}

export class ListVisionBoardsResponseDto extends PaginatedResponseDto<VisionBoardDto> {
  @ApiProperty({ type: [VisionBoardDto] })
  declare items: VisionBoardDto[];
}
