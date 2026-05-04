import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import {
  QuotePoolItemDto,
  DailyQuotesResponseDto,
  ListQuotePoolResponseDto,
  QuotesQuotaDto,
} from './dto';
import { PaginatedRequestDto, Pagination } from '@building-blocks/application';
import { QuoteFacade } from '@domain/quote/quote.facade';
import { QuotePoolMoods } from '@domain/quote/domain';
import { BeliefSystems } from '@domain/user-profile/domain';
import { IsEnum, IsOptional } from 'class-validator';

class ListQuotePoolQueryDto extends PaginatedRequestDto {
  @IsOptional()
  @IsEnum(QuotePoolMoods)
  mood?: QuotePoolMoods;

  @IsOptional()
  @IsEnum(BeliefSystems)
  beliefSystem?: BeliefSystems;
}

@Controller('users/me/quotes')
@RequiredAuth()
export class QuoteController {
  constructor(private readonly quoteFacade: QuoteFacade) {}

  @HttpCode(HttpStatus.OK)
  @Get('/daily')
  async getDailyQuotes(
    @CurrentUser() authUser: AuthUser,
  ): Promise<DailyQuotesResponseDto> {
    const today = new Date().toISOString().split('T')[0];
    const quotes = await this.quoteFacade.getDailyQuotes({
      userProfileId: authUser.userProfileId,
      date: today,
      isPremium: authUser.hasPremiumEntitlement,
    });
    return DailyQuotesResponseDto.from(quotes);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async listQuotePool(
    @CurrentUser() authUser: AuthUser,
    @Query() queryParams: ListQuotePoolQueryDto,
  ): Promise<ListQuotePoolResponseDto> {
    const quota = await this.quoteFacade.getQuotesQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    if (!quota.browseAllowed) {
      throw new ForbiddenException('Quote browsing requires premium');
    }

    const results = await this.quoteFacade.listQuotePool({
      pagination: Pagination.from(queryParams),
      mood: queryParams.mood,
      beliefSystem: queryParams.beliefSystem,
    });
    return ListQuotePoolResponseDto.from(results, QuotePoolItemDto.fromEntity);
  }

  // Has to be placed before the /:id route to avoid path conflict
  @Get('/quota')
  async getQuoteQuota(
    @CurrentUser() authUser: AuthUser,
  ): Promise<QuotesQuotaDto> {
    const data = await this.quoteFacade.getQuotesQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    return QuotesQuotaDto.fromEntity(data);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:quoteId')
  async getQuoteById(
    @CurrentUser() authUser: AuthUser,
    @UuidParam('quoteId') quoteId: string,
  ): Promise<QuotePoolItemDto> {
    const quote = await this.quoteFacade.getQuoteById({
      userProfileId: authUser.userProfileId,
      quoteId,
    });
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return QuotePoolItemDto.fromEntity(quote);
  }
}
