import { GetQuotesQuotaQueryResult } from '@domain/quote/application/queries/get-quotes-quota';

export class QuotesQuotaDto {
  dailyLimit: number;
  browseAllowed: boolean;

  static fromEntity(query: GetQuotesQuotaQueryResult): QuotesQuotaDto {
    return {
      dailyLimit: query.dailyLimit,
      browseAllowed: query.browseAllowed,
    };
  }
}
