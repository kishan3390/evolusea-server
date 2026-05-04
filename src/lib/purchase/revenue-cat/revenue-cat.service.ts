import { Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';

import { ConfigProvider } from '@config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  CustomerListPageV2,
  RevenueCatCustomerEntitlementsV2,
  RevenueCatCustomerV1,
} from './models';

@Injectable()
export class RevenueCatService {
  private readonly logger;
  private readonly apiKeyV1: string;
  private readonly apiKeyV2: string;
  private readonly baseUrl = 'https://api.revenuecat.com';
  private readonly projectId: string;
  private readonly requestMaxRetries = 10;
  private readonly defaultSleepTimeInSeconds = 60;

  constructor(private readonly httpService: HttpService) {
    this.logger = new Logger(RevenueCatService.name);
    this.apiKeyV1 = ConfigProvider.revenueCat.apiKeyV1;
    if (!this.apiKeyV1) {
      this.logger.warn('Revenue Cat api key v1 is not set');
    }

    this.apiKeyV2 = ConfigProvider.revenueCat.apiKeyV2;
    if (!this.apiKeyV2) {
      this.logger.warn('Revenue Cat api key v1 is not set');
    }

    this.projectId = ConfigProvider.revenueCat.projectId;
    if (!this.projectId) {
      this.logger.warn('Revenue Cat project id is not set');
    }
  }

  async getCustomerByAppUserIdV1(
    appUserId: string,
  ): Promise<RevenueCatCustomerV1 | null> {
    this.logger.debug(
      `Fetching customer with accountId '${appUserId}' from RevenueCat API v1`,
    );
    try {
      const response$ = this.httpService.get(
        `${this.baseUrl}/v1/subscribers/${appUserId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKeyV1}`,
            Accept: 'application/json',
          },
        },
      );
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Failed to fetch customer ${appUserId} from RevenueCat`,
        axiosError.message,
      );
      return null;
    }
  }

  async getCustomerEntitlementsByAppUserIdV2(
    appUserId: string,
  ): Promise<RevenueCatCustomerEntitlementsV2 | null> {
    return this.executeWithRetry(
      this.getCustomerEntitlementsByAppUserIdV2WithRetry.bind(this),
      {
        appUserId,
      },
    );
  }

  private async getCustomerEntitlementsByAppUserIdV2WithRetry(params: {
    appUserId: string;
  }): Promise<RevenueCatCustomerEntitlementsV2 | null> {
    this.logger.debug(
      `Fetching customer with accountId '${params.appUserId}' from RevenueCat API v2`,
    );
    try {
      const response$ = this.httpService.get(
        `${this.baseUrl}/v2/projects/${this.projectId}/customers/${params.appUserId}/active_entitlements`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKeyV2}`,
            Accept: 'application/json',
          },
        },
      );
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Failed to fetch customer entitlements ${params.appUserId} from RevenueCat`,
        axiosError.message,
      );
      return null;
    }
  }

  private async listCustomersPage(
    limit: number,
    startingAfter?: string,
  ): Promise<AxiosResponse<CustomerListPageV2>> {
    const url = new URL(
      `${this.baseUrl}/v2/projects/${this.projectId}/customers`,
    );
    url.searchParams.append('limit', limit.toString());
    if (startingAfter) {
      url.searchParams.append('starting_after', startingAfter);
    }
    const urlString = url.toString();

    const response$ = this.httpService.get(urlString, {
      headers: {
        Authorization: `Bearer ${this.apiKeyV2}`,
        Accept: 'application/json',
      },
    });
    return lastValueFrom(response$);
  }

  private async executeWithRetry<
    Params extends Record<string, any>,
    ReturnData,
  >(
    executable: (args: Params) => Promise<ReturnData>,
    args: Params,
    retryCount: number = 0,
  ): Promise<ReturnData> {
    try {
      return await executable(args);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        if (retryCount > this.requestMaxRetries) {
          this.logger.warn(
            `Rate limit exceeded, giving up after ${retryCount} retries. Last error: ${axiosError.message}`,
          );
          throw error;
        }

        // Only v2 endpoints return the retry-after header
        const retryAfterInSeconds =
          axiosError.response.headers['retry-after'] ??
          this.defaultSleepTimeInSeconds;
        await new Promise((resolve) =>
          setTimeout(resolve, retryAfterInSeconds * 1000),
        );

        this.logger.warn(
          `Rate limit exceeded, retrying in '${retryAfterInSeconds}' seconds. Retry count: ${retryCount + 1}`,
        );
        return this.executeWithRetry(executable, args, retryCount + 1);
      }
      throw error;
    }
  }
}
