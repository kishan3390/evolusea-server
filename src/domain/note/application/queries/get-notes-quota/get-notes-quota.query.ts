export interface GetNotesQuotaQuery {
  accountIsPremium: boolean;
  userProfileId: string;
  now?: Date;
}

export interface GetNotesQuotaQueryResult {
  create: {
    isAllowed: boolean;
    limit: number | null;
    remaining: number | null;
  };
}
