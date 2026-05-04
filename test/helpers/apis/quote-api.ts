import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { QuotesQuotaDto, QuotePoolItemDto, DailyQuotesResponseDto, ListQuotePoolResponseDto } from '../../../src/http-app/quote/dto';
import { PaginatedRequestDto } from '@building-blocks/application';

export function quoteApi(user: SignedInAccount) {
  return {
    async getDailyQuotes(): Promise<ApiResponse<DailyQuotesResponseDto>> {
      return await user.authenticatedRequest.get(`/users/me/quotes/daily`);
    },

    async getQuoteById(quoteId: string): Promise<ApiResponse<QuotePoolItemDto>> {
      return await user.authenticatedRequest.get(`/users/me/quotes/${quoteId}`);
    },

    async listQuotePool(
      pagination?: PaginatedRequestDto,
    ): Promise<ApiResponse<ListQuotePoolResponseDto>> {
      return await user.authenticatedRequest.get(`/users/me/quotes`).query({
        ...(pagination ?? { page: 1, perPage: 10 }),
      });
    },

    async getQuotesQuota(): Promise<ApiResponse<QuotesQuotaDto>> {
      return await user.authenticatedRequest.get(`/users/me/quotes/quota`);
    },
  };
}

export type QuoteAPI = ReturnType<typeof quoteApi>;
