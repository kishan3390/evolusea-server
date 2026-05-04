import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@building-blocks/application';
import { QuotePoolItemDto } from './quote-pool-item.dto';

export class ListQuotePoolResponseDto extends PaginatedResponseDto<QuotePoolItemDto> {
  @ApiProperty({ type: [QuotePoolItemDto] })
  declare items: QuotePoolItemDto[];
}
