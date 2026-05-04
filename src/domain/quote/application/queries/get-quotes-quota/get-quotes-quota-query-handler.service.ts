import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import {
  GetQuotesQuotaQuery,
  GetQuotesQuotaQueryResult,
} from './get-quotes-quota.query';

@Injectable()
export class GetQuotesQuotaQueryHandler
  implements QueryHandler<GetQuotesQuotaQuery, GetQuotesQuotaQueryResult>
{
  async handle(query: GetQuotesQuotaQuery): Promise<GetQuotesQuotaQueryResult> {
    if (query.accountIsPremium) {
      return {
        dailyLimit: 3,
        browseAllowed: true,
      };
    } else {
      return {
        dailyLimit: 1,
        browseAllowed: false,
      };
    }
  }
}
