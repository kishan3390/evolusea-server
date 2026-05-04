import { describe, it, expect } from 'vitest';
import { calculateStreak } from './streak-calculator';

describe('calculateStreak', () => {
  it('returns zeros for empty dates', () => {
    const result = calculateStreak([], '2026-02-10');
    expect(result).toEqual({ currentStreak: 0, bestStreak: 0, totalDays: 0 });
  });

  it('returns 1 for a single day that is today', () => {
    const result = calculateStreak(['2026-02-10'], '2026-02-10');
    expect(result).toEqual({ currentStreak: 1, bestStreak: 1, totalDays: 1 });
  });

  it('returns 1 for a single day that is yesterday', () => {
    const result = calculateStreak(['2026-02-09'], '2026-02-10');
    expect(result).toEqual({ currentStreak: 1, bestStreak: 1, totalDays: 1 });
  });

  it('returns currentStreak 0 for a single old day', () => {
    const result = calculateStreak(['2026-01-01'], '2026-02-10');
    expect(result).toEqual({ currentStreak: 0, bestStreak: 1, totalDays: 1 });
  });

  it('calculates consecutive days ending today', () => {
    const dates = ['2026-02-07', '2026-02-08', '2026-02-09', '2026-02-10'];
    const result = calculateStreak(dates, '2026-02-10');
    expect(result).toEqual({ currentStreak: 4, bestStreak: 4, totalDays: 4 });
  });

  it('calculates consecutive days ending yesterday', () => {
    const dates = ['2026-02-07', '2026-02-08', '2026-02-09'];
    const result = calculateStreak(dates, '2026-02-10');
    expect(result).toEqual({ currentStreak: 3, bestStreak: 3, totalDays: 3 });
  });

  it('handles gap — current streak is only the recent run', () => {
    const dates = [
      '2026-01-01', '2026-01-02', '2026-01-03', // 3-day old streak
      '2026-02-09', '2026-02-10',                // 2-day current streak
    ];
    const result = calculateStreak(dates, '2026-02-10');
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(3);
    expect(result.totalDays).toBe(5);
  });

  it('deduplicates dates', () => {
    const dates = ['2026-02-10', '2026-02-10', '2026-02-10'];
    const result = calculateStreak(dates, '2026-02-10');
    expect(result).toEqual({ currentStreak: 1, bestStreak: 1, totalDays: 1 });
  });

  it('handles unsorted dates', () => {
    const dates = ['2026-02-10', '2026-02-08', '2026-02-09'];
    const result = calculateStreak(dates, '2026-02-10');
    expect(result).toEqual({ currentStreak: 3, bestStreak: 3, totalDays: 3 });
  });

  it('returns currentStreak 0 when last date is more than 1 day ago', () => {
    const dates = ['2026-02-01', '2026-02-02', '2026-02-03'];
    const result = calculateStreak(dates, '2026-02-10');
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(3);
    expect(result.totalDays).toBe(3);
  });

  it('bestStreak tracks the longest historical run', () => {
    const dates = [
      '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05', // 5-day run
      '2026-01-10', '2026-01-11',                                             // 2-day run
      '2026-02-10',                                                           // 1-day current
    ];
    const result = calculateStreak(dates, '2026-02-10');
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(5);
    expect(result.totalDays).toBe(8);
  });
});
