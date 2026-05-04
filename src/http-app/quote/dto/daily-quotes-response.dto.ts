import { ApiProperty } from '@nestjs/swagger';
import { QuotePoolItemDto } from './quote-pool-item.dto';
import { QuotePoolItem } from '@domain/quote/domain';

export class DailyQuotesResponseDto {
  @ApiProperty({ type: [QuotePoolItemDto] })
  items: QuotePoolItemDto[];

  static from(quotes: QuotePoolItem[]): DailyQuotesResponseDto {
    return {
      items: quotes.map(QuotePoolItemDto.fromEntity),
    };
  }
}
