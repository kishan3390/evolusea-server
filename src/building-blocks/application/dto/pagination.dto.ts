import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max } from 'class-validator';
import { PaginatedList } from '../pagination';

export class PaginatedRequestDto {
  @IsPositive()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Number)
  page: number = 1;

  @IsPositive()
  @IsOptional()
  @Max(200)
  @ApiPropertyOptional()
  @Type(() => Number)
  perPage: number = 200;
}

export class PaginatedResponseDto<T> {
  totalPages: number;
  totalItems: number;
  hasMore: boolean;

  @ApiProperty({ isArray: true })
  items: T[];

  static from<InputT, OutputT = InputT>(
    data: PaginatedList<InputT>,
    mapper: (m: InputT) => OutputT,
  ): PaginatedResponseDto<OutputT> {
    return {
      totalItems: Number(data.totalItems),
      totalPages: Number(data.totalPages),
      hasMore: Boolean(data.hasMore),
      items: data.items.map(mapper),
    };
  }

  static async asyncFrom<InputT, OutputT = InputT>(
    data: PaginatedList<InputT>,
    mapper: (m: InputT) => Promise<OutputT>,
  ): Promise<PaginatedResponseDto<OutputT>> {
    return {
      totalItems: Number(data.totalItems),
      totalPages: Number(data.totalPages),
      hasMore: Boolean(data.hasMore),
      items: await Promise.all(data.items.map(mapper)),
    };
  }
}
