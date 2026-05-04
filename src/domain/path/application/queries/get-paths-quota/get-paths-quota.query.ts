export interface GetPathsQuotaQuery {
  accountIsPremium: boolean;
  userProfileId: string;
  now?: Date;
}

export interface GetPathsQuotaQueryResult {
  create: {
    isAllowed: boolean;
    limit: number | null;
    remaining: number | null;
  };
}
