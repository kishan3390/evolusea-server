export interface GetVisionBoardsQuotaQuery {
  accountIsPremium: boolean;
  userProfileId: string;
}

export interface GetVisionBoardsQuotaQueryResult {
  create: {
    isAllowed: boolean;
    limit: number | null;
    remaining: number | null;
  };
}
