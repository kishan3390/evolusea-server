import { IsDateString, IsOptional } from 'class-validator';
import { PaginatedRequestDto } from '@building-blocks/application';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListPathsQueryDto extends PaginatedRequestDto {
  @ApiPropertyOptional({
    example: '2025-11-25T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({
    example: '2025-11-28T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({
    example: '2025-11-26'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2025-11-29'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
