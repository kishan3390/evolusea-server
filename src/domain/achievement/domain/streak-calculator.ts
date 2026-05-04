export interface StreakResult {
  /** Current consecutive streak (days ending today or yesterday) */
  currentStreak: number;
  /** Longest consecutive streak ever */
  bestStreak: number;
  /** Total unique engagement days */
  totalDays: number;
}

/**
 * Pure function that calculates streak data from a list of engagement date strings.
 *
 * @param dateStrings Array of date strings in YYYY-MM-DD format (need not be sorted or unique)
 * @param today Today's date string in YYYY-MM-DD format
 */
export function calculateStreak(
  dateStrings: string[],
  today: string,
): StreakResult {
  if (dateStrings.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalDays: 0 };
  }

  // Deduplicate and sort ascending
  const uniqueDays = [...new Set(dateStrings)].sort();
  const totalDays = uniqueDays.length;

  if (totalDays === 1) {
    const isActive = uniqueDays[0] === today || uniqueDays[0] === getPreviousDay(today);
    return {
      currentStreak: isActive ? 1 : 0,
      bestStreak: 1,
      totalDays: 1,
    };
  }

  // Calculate best streak by walking through all dates
  let bestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    if (isConsecutive(uniqueDays[i - 1], uniqueDays[i])) {
      runningStreak++;
    } else {
      runningStreak = 1;
    }
    bestStreak = Math.max(bestStreak, runningStreak);
  }

  // Calculate current streak by walking backwards from the last date
  const lastDay = uniqueDays[uniqueDays.length - 1];
  const isActive = lastDay === today || lastDay === getPreviousDay(today);

  let currentStreak = 0;
  if (isActive) {
    currentStreak = 1;
    for (let i = uniqueDays.length - 2; i >= 0; i--) {
      if (isConsecutive(uniqueDays[i], uniqueDays[i + 1])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return { currentStreak, bestStreak, totalDays };
}

function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
}

function isConsecutive(earlier: string, later: string): boolean {
  const d1 = new Date(earlier + 'T00:00:00Z');
  const d2 = new Date(later + 'T00:00:00Z');
  const diffMs = d2.getTime() - d1.getTime();
  return diffMs === 24 * 60 * 60 * 1000;
}
