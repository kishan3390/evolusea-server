import { Injectable, Logger } from '@nestjs/common';

export interface OutputFilterResult {
  content: string;
  wasFlagged: boolean;
  flags: string[];
}

/** Crisis hotline numbers that are allowed in responses */
const CRISIS_NUMBERS = ['1323', '119'];

/** Keywords that indicate crisis/self-harm content */
const CRISIS_KEYWORDS = [
  'suicide',
  'self-harm',
  'self harm',
  'kill myself',
  'end my life',
  'want to die',
  'hurt myself',
  'ฆ่าตัวตาย', // Thai: suicide
  'ทำร้ายตัวเอง', // Thai: self-harm
  'bunuh diri', // Indonesian: suicide
];

/** Maximum length for AI response (in characters).
 * Aligned with maxTokens: 1500 which produces ~3000-3500 chars in Thai/Indonesian. */
export const MAX_RESPONSE_LENGTH = 3_500;

/** Redirect message when off-topic content is detected */
const REDIRECT_MESSAGE =
  "I'd like to keep our conversation focused on your spiritual journey. What's on your mind today?";

/** Crisis resources to append when missing from crisis-related responses */
const CRISIS_RESOURCES = `

If you're going through a difficult time, please reach out:
- Thailand: 1323 (Department of Mental Health Hotline)
- Indonesia: 119 ext 8 (Kemenkes RI Crisis Line) or Into The Light Indonesia 021-7884-5555`;

@Injectable()
export class CompassOutputSafetyFilterService {
  private readonly logger = new Logger(CompassOutputSafetyFilterService.name);

  /**
   * Applies post-generation safety filters to AI responses.
   * Must be called AFTER receiving AI response and BEFORE saving to DB.
   */
  filter(content: string, userMessage?: string): OutputFilterResult {
    const flags: string[] = [];
    let filteredContent = content;

    // 1. Detect code blocks (triple backticks) — AI should never output code
    if (this.containsCodeBlocks(filteredContent)) {
      flags.push('code_blocks_detected');
      this.logger.warn('AI output contained code blocks — replacing with redirect', {
        originalLength: content.length,
      });
      return {
        content: REDIRECT_MESSAGE,
        wasFlagged: true,
        flags,
      };
    }

    // 2. Detect excessive URLs (>2, excluding crisis numbers)
    const urlCount = this.countNonCrisisUrls(filteredContent);
    if (urlCount > 2) {
      flags.push(`excessive_urls:${urlCount}`);
      this.logger.warn('AI output contained too many URLs — replacing with redirect', {
        urlCount,
      });
      return {
        content: REDIRECT_MESSAGE,
        wasFlagged: true,
        flags,
      };
    }

    // 3. Detect PII patterns
    if (this.containsPII(filteredContent)) {
      flags.push('pii_detected');
      this.logger.warn('AI output contained PII patterns — replacing with redirect');
      return {
        content: REDIRECT_MESSAGE,
        wasFlagged: true,
        flags,
      };
    }

    // 4. Crisis safety check — ensure crisis resources are present if discussing crisis topics
    if (this.containsCrisisContent(filteredContent) || this.containsCrisisContent(userMessage ?? '')) {
      if (!this.containsCrisisNumbers(filteredContent)) {
        flags.push('crisis_resources_appended');
        filteredContent += CRISIS_RESOURCES;
      }
    }

    // 5. Response length cap — truncate at last sentence boundary before limit
    if (filteredContent.length > MAX_RESPONSE_LENGTH) {
      flags.push(`response_truncated:${filteredContent.length}`);
      filteredContent = this.truncateAtSentenceBoundary(
        filteredContent,
        MAX_RESPONSE_LENGTH,
      );
    }

    return {
      content: filteredContent,
      wasFlagged: flags.length > 0,
      flags,
    };
  }

  private containsCodeBlocks(content: string): boolean {
    return /```[\s\S]*?```/.test(content);
  }

  private countNonCrisisUrls(content: string): number {
    const urlPattern = /https?:\/\/[^\s)]+/gi;
    const matches = content.match(urlPattern) ?? [];
    // Exclude crisis-related URLs
    return matches.filter(
      (url) => !CRISIS_NUMBERS.some((num) => url.includes(num)),
    ).length;
  }

  private containsPII(content: string): boolean {
    // Email pattern
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailPattern.test(content)) return true;

    // Credit card patterns (basic: 4 groups of 4 digits)
    const ccPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
    if (ccPattern.test(content)) return true;

    // SSN-like pattern
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
    if (ssnPattern.test(content)) return true;

    return false;
  }

  private containsCrisisContent(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return CRISIS_KEYWORDS.some((keyword) =>
      lowerContent.includes(keyword.toLowerCase()),
    );
  }

  private containsCrisisNumbers(content: string): boolean {
    return CRISIS_NUMBERS.some((num) => content.includes(num));
  }

  private truncateAtSentenceBoundary(
    content: string,
    maxLength: number,
  ): string {
    if (content.length <= maxLength) return content;

    const truncated = content.substring(0, maxLength);

    // Find last sentence-ending punctuation
    const sentenceEnders = ['. ', '.\n', '! ', '!\n', '? ', '?\n', '。', '！', '？'];
    let lastSentenceEnd = -1;

    for (const ender of sentenceEnders) {
      const idx = truncated.lastIndexOf(ender);
      if (idx > lastSentenceEnd) {
        lastSentenceEnd = idx + 1; // Include the punctuation mark
      }
    }

    // If we found a sentence boundary, use it; otherwise just truncate
    if (lastSentenceEnd > maxLength * 0.5) {
      return truncated.substring(0, lastSentenceEnd).trim();
    }

    return truncated.trim();
  }
}
