import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

/**
 * In-memory per-message rate limiter.
 * Prevents rapid-fire message abuse — 1 message per 3 seconds per user:chat pair.
 */
@Injectable()
export class CompassChatRateLimitGuard implements CanActivate {
  /** Map of "userId:chatId" → last message timestamp */
  private readonly lastMessageTimestamps = new Map<string, number>();

  /** Minimum interval between messages in milliseconds */
  private readonly MIN_INTERVAL_MS = 3_000;

  /** Cleanup entries older than this (ms) */
  private readonly CLEANUP_THRESHOLD_MS = 60_000;

  /** Run cleanup every N checks */
  private checkCounter = 0;
  private readonly CLEANUP_INTERVAL = 100;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userProfileId;
    const chatId = request.params?.compassChatId;

    if (!userId || !chatId) {
      return true; // Can't enforce without identifiers
    }

    const key = `${userId}:${chatId}`;
    const now = Date.now();
    const lastTimestamp = this.lastMessageTimestamps.get(key);

    // Periodic cleanup of stale entries
    this.checkCounter++;
    if (this.checkCounter >= this.CLEANUP_INTERVAL) {
      this.checkCounter = 0;
      this.cleanupStaleEntries(now);
    }

    if (lastTimestamp && now - lastTimestamp < this.MIN_INTERVAL_MS) {
      throw new HttpException(
        'Please wait a moment before sending another message.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.lastMessageTimestamps.set(key, now);
    return true;
  }

  private cleanupStaleEntries(now: number): void {
    for (const [key, timestamp] of this.lastMessageTimestamps.entries()) {
      if (now - timestamp > this.CLEANUP_THRESHOLD_MS) {
        this.lastMessageTimestamps.delete(key);
      }
    }
  }
}
