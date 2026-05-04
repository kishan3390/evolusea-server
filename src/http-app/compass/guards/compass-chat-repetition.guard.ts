import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Detects repeated identical messages in a single chat.
 * Tracks last 5 message hashes per chatId.
 * If the same content hash appears 3+ times, rejects the 4th.
 */
@Injectable()
export class CompassChatRepetitionGuard implements CanActivate {
  private readonly logger = new Logger(CompassChatRepetitionGuard.name);

  /** Map of chatId → array of recent message content hashes */
  private readonly recentHashes = new Map<string, string[]>();

  /** Max hashes to keep per chat */
  private readonly MAX_HASHES = 5;

  /** Number of identical messages before rejection */
  private readonly MAX_IDENTICAL = 3;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const chatId = request.params?.compassChatId;
    const content = request.body?.content;

    if (!chatId || !content) {
      return true;
    }

    const hash = this.hashContent(content);
    const chatHashes = this.recentHashes.get(chatId) ?? [];

    // Count how many times this hash has appeared
    const identicalCount = chatHashes.filter((h) => h === hash).length;

    if (identicalCount >= this.MAX_IDENTICAL) {
      this.logger.warn(
        `Repetition detected — user repeated same message ${identicalCount + 1} times in chat ${chatId}`,
        { chatId, userId: request.user?.userProfileId },
      );

      throw new HttpException(
        "It seems like you're repeating yourself. I'm here whenever you'd like to share something new.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add hash, keep only last N
    chatHashes.push(hash);
    if (chatHashes.length > this.MAX_HASHES) {
      chatHashes.shift();
    }
    this.recentHashes.set(chatId, chatHashes);

    return true;
  }

  private hashContent(content: string): string {
    return createHash('sha256')
      .update(content.trim().toLowerCase())
      .digest('hex')
      .substring(0, 16);
  }
}
