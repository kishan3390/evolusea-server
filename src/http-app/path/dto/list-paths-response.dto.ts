import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../building-blocks/application';
import { PathDto } from './path.dto';

export class ListPathsResponseDto extends PaginatedResponseDto<PathDto> {
  @ApiProperty({ type: [PathDto] })
  declare items: PathDto[];
}
