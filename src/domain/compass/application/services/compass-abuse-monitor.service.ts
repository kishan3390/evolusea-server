import { Injectable, Logger } from '@nestjs/common';

export enum AbuseStatus {
  Normal = 'normal',
  Warning = 'warning',
  Suspended = 'suspended',
  Blocked = 'blocked',
}

interface UserAbuseRecord {
  sanitizationFlags: { timestamp: number }[];
  outputFlags: { timestamp: number }[];
  repetitionFlags: { timestamp: number }[];
  rateLimitHits: { timestamp: number }[];
  status: AbuseStatus;
  statusExpiresAt: number | null;
  dailyResetDate: string; // YYYY-MM-DD for daily reset
}

/** Escalation thresholds */
const THRESHOLDS = {
  /** 3+ sanitization flags per hour → warning */
  sanitizationPerHour: 3,
  /** 5+ output flags per hour → suspend chat for 1 hour */
  outputPerHour: 5,
  /** 10+ rate limit hits per 10 min → block for 24 hours */
  rateLimitPer10Min: 10,
};

/** Time windows in ms */
const ONE_HOUR_MS = 60 * 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CompassAbuseMonitorService {
  private readonly logger = new Logger(CompassAbuseMonitorService.name);
  private readonly records = new Map<string, UserAbuseRecord>();

  /**
   * Check if a user is currently allowed to use the chat.
   */
  getUserStatus(userId: string): AbuseStatus {
    const record = this.getOrCreateRecord(userId);
    
    // If status has expired, reset to normal
    if (
      record.statusExpiresAt &&
      Date.now() > record.statusExpiresAt
    ) {
      record.status = AbuseStatus.Normal;
      record.statusExpiresAt = null;
    }

    return record.status;
  }

  /**
   * Report a sanitization flag (prompt injection attempt detected).
   */
  reportSanitizationFlag(userId: string, patterns: string[]): void {
    const record = this.getOrCreateRecord(userId);
    const now = Date.now();
    record.sanitizationFlags.push({ timestamp: now });

    // Count flags in the last hour
    const recentCount = record.sanitizationFlags.filter(
      (f) => now - f.timestamp < ONE_HOUR_MS,
    ).length;

    if (recentCount >= THRESHOLDS.sanitizationPerHour) {
      this.logger.warn(
        `Abuse escalation: User '${userId}' has ${recentCount} sanitization flags/hour — applying WARNING`,
        { userId, patterns: patterns.slice(0, 5) },
      );
      if (record.status === AbuseStatus.Normal) {
        record.status = AbuseStatus.Warning;
      }
    }
  }

  /**
   * Report an output safety flag (AI generated unsafe content).
   */
  reportOutputFlag(userId: string, flags: string[]): void {
    const record = this.getOrCreateRecord(userId);
    const now = Date.now();
    record.outputFlags.push({ timestamp: now });

    // Count flags in the last hour
    const recentCount = record.outputFlags.filter(
      (f) => now - f.timestamp < ONE_HOUR_MS,
    ).length;

    if (recentCount >= THRESHOLDS.outputPerHour) {
      this.logger.warn(
        `Abuse escalation: User '${userId}' has ${recentCount} output flags/hour — SUSPENDING for 1 hour`,
        { userId, flags: flags.slice(0, 5) },
      );
      record.status = AbuseStatus.Suspended;
      record.statusExpiresAt = now + ONE_HOUR_MS;
    }
  }

  /**
   * Report a repetition flag (user repeating same message).
   */
  reportRepetitionFlag(userId: string): void {
    const record = this.getOrCreateRecord(userId);
    record.repetitionFlags.push({ timestamp: Date.now() });
  }

  /**
   * Report a rate limit hit.
   */
  reportRateLimitHit(userId: string): void {
    const record = this.getOrCreateRecord(userId);
    const now = Date.now();
    record.rateLimitHits.push({ timestamp: now });

    // Count hits in the last 10 minutes
    const recentCount = record.rateLimitHits.filter(
      (f) => now - f.timestamp < TEN_MINUTES_MS,
    ).length;

    if (recentCount >= THRESHOLDS.rateLimitPer10Min) {
      this.logger.warn(
        `Abuse escalation: User '${userId}' has ${recentCount} rate limit hits/10min — BLOCKING for 24 hours`,
        { userId },
      );
      record.status = AbuseStatus.Blocked;
      record.statusExpiresAt = now + TWENTY_FOUR_HOURS_MS;
    }
  }

  private getOrCreateRecord(userId: string): UserAbuseRecord {
    const today = new Date().toISOString().split('T')[0];
    let record = this.records.get(userId);

    // Daily reset
    if (record && record.dailyResetDate !== today) {
      record = undefined;
    }

    if (!record) {
      record = {
        sanitizationFlags: [],
        outputFlags: [],
        repetitionFlags: [],
        rateLimitHits: [],
        status: AbuseStatus.Normal,
        statusExpiresAt: null,
        dailyResetDate: today,
      };
      this.records.set(userId, record);
    }

    // Clean up old entries periodically (keep last hour only)
    const cutoff = Date.now() - ONE_HOUR_MS;
    record.sanitizationFlags = record.sanitizationFlags.filter(
      (f) => f.timestamp > cutoff,
    );
    record.outputFlags = record.outputFlags.filter(
      (f) => f.timestamp > cutoff,
    );
    record.repetitionFlags = record.repetitionFlags.filter(
      (f) => f.timestamp > cutoff,
    );
    record.rateLimitHits = record.rateLimitHits.filter(
      (f) => f.timestamp > cutoff,
    );

    return record;
  }
}
