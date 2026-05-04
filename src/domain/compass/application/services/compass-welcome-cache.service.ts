import { Injectable, Logger } from '@nestjs/common';

interface CachedWelcomeMessage {
  /** The AI-generated welcome message content */
  content: string;
  /** When the cache entry was created */
  cachedAt: Date;
}

/** TTL for cached welcome messages: 24 hours */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Max entries to keep in cache (LRU eviction beyond this) */
const MAX_CACHE_SIZE = 50;

@Injectable()
export class CompassWelcomeCacheService {
  private readonly logger = new Logger(CompassWelcomeCacheService.name);

  /**
   * In-memory LRU cache keyed by "belief:personality:intention"
   * Using Map which preserves insertion order for LRU eviction.
   */
  private readonly cache = new Map<string, CachedWelcomeMessage>();

  /**
   * Build the cache key from user profile and chat attributes.
   */
  buildCacheKey(belief: string, personality: string, intention: string): string {
    return `${belief}:${personality}:${intention}`;
  }

  /**
   * Try to get a cached welcome message.
   * Returns the cached content (with user name substituted) or null if not cached/expired.
   */
  get(key: string, userName: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.cachedAt.getTime() > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU refresh)
    this.cache.delete(key);
    this.cache.set(key, entry);

    // Substitute user name in cached content
    // The cached message may contain a generic name placeholder or no name at all
    return entry.content;
  }

  /**
   * Store a welcome message in the cache.
   */
  set(key: string, content: string): void {
    // Evict oldest entry if we're at capacity
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      content,
      cachedAt: new Date(),
    });

    this.logger.debug(`Welcome message cached for key: ${key}`);
  }

  /**
   * Clear the entire cache.
   */
  clear(): void {
    this.cache.clear();
  }
}
