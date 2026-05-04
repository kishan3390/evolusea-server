import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { DISABLE_BODY_PROMPT_INJECTION_SANITIZER } from '../decorators/disable-prompt-injection-sanitizer.decorator';

/**
 * Result of sanitizing a single string value.
 */
export interface SanitizationResult {
  sanitizedContent: string;
  wasSanitized: boolean;
  flaggedPatterns: string[];
}

// --- Regex patterns for various injection vectors ---

/** XML/HTML-style prompt markup tags (system, user, assistant, etc.) */
const PROMPT_TAGS_REGEX = /<\/?(?:system|user|assistant)(?:\s[^>]*)?\s*>/gi;

/** Model-specific control tokens used by various LLMs */
const CONTROL_TOKENS_REGEX =
  /<\|(?:im_start|im_end|system|user|assistant|endoftext)\|>|<\/?s>|\[(?:INST|\/INST)\]/g;

/** Prompt override phrases — case-insensitive, at start of string or after newlines */
const PROMPT_OVERRIDE_PATTERNS: RegExp[] = [
  /(?:^|\n)\s*ignore\s+(?:all\s+)?previous\s+instructions/gi,
  /(?:^|\n)\s*you\s+are\s+now\b/gi,
  /(?:^|\n)\s*forget\s+everything\s+above/gi,
  /(?:^|\n)\s*new\s+system\s+prompt\s*:/gi,
  /(?:^|\n)\s*disregard\s+(?:all\s+)?prior/gi,
  /(?:^|\n)\s*override\s*:/gi,
  /(?:^|\n)\s*system\s*:/gi,
  /(?:^|\n)\s*assistant\s*:/gi,
  /(?:^|\n)\s*from\s+now\s+on\s*,?\s*you\s+(?:are|will|must)/gi,
  /(?:^|\n)\s*pretend\s+(?:you\s+are|to\s+be)/gi,
  /(?:^|\n)\s*act\s+as\s+(?:if\s+)?(?:you\s+are\s+)?(?:a|an)\s/gi,
  /(?:^|\n)\s*(?:enter|switch\s+to)\s+(?:.*?\s+)?mode/gi,
  /(?:^|\n)\s*do\s+not\s+follow\s+(?:any\s+)?(?:previous|prior|above)\s+(?:instructions|rules)/gi,
];

/** Excessive consecutive newlines (more than 5) — collapse to max 2 */
const EXCESSIVE_NEWLINES_REGEX = /\n{6,}/g;

/**
 * Cyrillic homoglyph map — only the characters that look identical to Latin.
 * These Unicode ranges do NOT overlap with Thai (U+0E00–U+0E7F),
 * Indonesian (standard Latin), or Arabic (U+0600–U+06FF) scripts.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  '\u0410': 'A', // А → A
  '\u0412': 'B', // В → B
  '\u0421': 'C', // С → C
  '\u0415': 'E', // Е → E
  '\u041D': 'H', // Н → H
  '\u041A': 'K', // К → K
  '\u041C': 'M', // М → M
  '\u041E': 'O', // О → O
  '\u0420': 'P', // Р → P
  '\u0422': 'T', // Т → T
  '\u0425': 'X', // Х → X
  '\u0430': 'a', // а → a
  '\u0435': 'e', // е → e
  '\u043E': 'o', // о → o
  '\u0440': 'p', // р → p
  '\u0441': 'c', // с → c
  '\u0443': 'u', // у → u
  '\u0445': 'x', // х → x
  '\u0456': 'i', // і → i
};

const CYRILLIC_HOMOGLYPH_REGEX = new RegExp(
  `[${Object.keys(CYRILLIC_TO_LATIN).join('')}]`,
  'g',
);

@Injectable()
export class BodyPromptMarkupSanitizerInterceptor implements NestInterceptor {
  private readonly logger: Logger;

  constructor(private readonly reflector: Reflector) {
    this.logger = new Logger(BodyPromptMarkupSanitizerInterceptor.name);
  }

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const isDisabled = this.reflector.getAllAndOverride<boolean>(
      DISABLE_BODY_PROMPT_INJECTION_SANITIZER,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (isDisabled) {
      return next.handle();
    }

    const req = ctx.switchToHttp().getRequest();
    const logCtx = {
      accountId: req.user?.accountId,
      userId: req.user?.userProfileId,
    };

    if (req?.body && typeof req.body === 'object') {
      try {
        const flaggedPatterns: string[] = [];
        req.body = this.deepSanitize(req.body, flaggedPatterns);

        if (flaggedPatterns.length) {
          this.logger.warn(
            `Request body sanitized — ${flaggedPatterns.length} prompt injection pattern(s) detected:`,
            {
              ...logCtx,
              flaggedPatterns: flaggedPatterns.slice(0, 10),
            },
          );
        }
      } catch (error) {
        this.logger.error(
          'Skipping prompt markup sanitization due to error:',
          error,
          logCtx,
        );
      }
    }
    return next.handle();
  }

  private deepSanitize(
    value: unknown,
    flaggedPatternsRef: string[],
  ): unknown {
    if (typeof value === 'string') {
      return this.sanitizeString(value, flaggedPatternsRef).sanitizedContent;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.deepSanitize(item, flaggedPatternsRef));
    }
    if (value && typeof value === 'object') {
      const sanitizedObject: Record<string, unknown> = {};
      for (const [key, fieldValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        sanitizedObject[key] = this.deepSanitize(fieldValue, flaggedPatternsRef);
      }
      return sanitizedObject;
    }
    return value;
  }

  /**
   * Core sanitization logic for a single string.
   * Order of operations:
   * 1. Normalize Cyrillic homoglyphs to Latin (for pattern matching)
   * 2. Strip model control tokens
   * 3. Strip prompt markup tags
   * 4. Detect and remove prompt override phrases
   * 5. Collapse excessive newlines
   */
  sanitizeString(
    input: string,
    flaggedPatternsRef: string[],
  ): SanitizationResult {
    let result = input;

    // 1. Normalize Cyrillic homoglyphs to Latin equivalents
    result = result.replace(CYRILLIC_HOMOGLYPH_REGEX, (char) => {
      const replacement = CYRILLIC_TO_LATIN[char];
      if (replacement) {
        flaggedPatternsRef.push(`homoglyph:${char}→${replacement}`);
        return replacement;
      }
      return char;
    });

    // 2. Strip model-specific control tokens
    result = result.replace(CONTROL_TOKENS_REGEX, (match) => {
      flaggedPatternsRef.push(`control_token:${match}`);
      return '';
    });

    // 3. Strip prompt markup tags (<system>, </user>, etc.)
    result = result.replace(PROMPT_TAGS_REGEX, (match) => {
      flaggedPatternsRef.push(`prompt_tag:${match}`);
      return '';
    });

    // 4. Detect and remove prompt override phrases
    for (const pattern of PROMPT_OVERRIDE_PATTERNS) {
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
      const matches = result.match(pattern);
      if (matches) {
        for (const match of matches) {
          flaggedPatternsRef.push(`override_phrase:${match.trim()}`);
        }
        result = result.replace(pattern, '\n');
      }
    }

    // 5. Collapse excessive newlines (>5 consecutive → max 2)
    const beforeNewlineCollapse = result;
    result = result.replace(EXCESSIVE_NEWLINES_REGEX, '\n\n');
    if (result !== beforeNewlineCollapse) {
      flaggedPatternsRef.push('excessive_newlines');
    }

    return {
      sanitizedContent: result.trim(),
      wasSanitized: flaggedPatternsRef.length > 0,
      flaggedPatterns: flaggedPatternsRef,
    };
  }
}
