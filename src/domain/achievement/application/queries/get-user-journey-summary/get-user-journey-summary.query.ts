export interface GetUserJourneySummaryQuery {
  userProfileId: string;
}

export interface JourneySummaryResult {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  nextMilestone: {
    id: string;
    nameKey: string;
    threshold: number;
    remaining: number;
  } | null;
  latestUnlockedMilestone: {
    id: string;
    nameKey: string;
    threshold: number;
  } | null;
}
