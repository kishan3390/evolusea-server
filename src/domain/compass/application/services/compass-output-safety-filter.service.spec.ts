import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CompassOutputSafetyFilterService,
  MAX_RESPONSE_LENGTH,
} from './compass-output-safety-filter.service';

describe('CompassOutputSafetyFilterService', () => {
  let service: CompassOutputSafetyFilterService;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    service = new CompassOutputSafetyFilterService();
  });

  it('returns content unchanged when no issues detected', () => {
    const content = 'A thoughtful reflection on mindfulness.';
    const result = service.filter(content);
    expect(result.content).toBe(content);
    expect(result.wasFlagged).toBe(false);
    expect(result.flags).toEqual([]);
  });

  it('flags and replaces content when code blocks detected', () => {
    const content = 'Here is some text.\n```js\nconsole.log("hi");\n```\nMore text.';
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags).toContain('code_blocks_detected');
    expect(result.content).toContain('spiritual journey');
    expect(result.content).not.toContain('```');
  });

  it('flags and replaces content when excessive URLs present', () => {
    const content = [
      'Check https://example.com',
      'and https://foo.org',
      'and https://bar.net',
      'and https://baz.io',
    ].join(' ');
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags.some((f) => f.startsWith('excessive_urls'))).toBe(true);
    expect(result.content).toContain('spiritual journey');
  });

  it('allows up to 2 URLs without flagging', () => {
    const content = 'See https://example.com and https://foo.org for more.';
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(false);
    expect(result.content).toBe(content);
  });

  it('flags and replaces content when PII (email) detected', () => {
    const content = 'Contact me at user@example.com for support.';
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags).toContain('pii_detected');
    expect(result.content).toContain('spiritual journey');
  });

  it('flags and replaces content when credit card pattern detected', () => {
    const content = 'My card is 1234 5678 9012 3456.';
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags).toContain('pii_detected');
  });

  it('flags and replaces content when SSN pattern detected', () => {
    const content = 'My SSN is 123-45-6789.';
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags).toContain('pii_detected');
  });

  it('appends crisis resources when crisis content detected and no crisis numbers', () => {
    const content = 'I have been thinking about suicide lately.';
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags).toContain('crisis_resources_appended');
    expect(result.content).toContain('1323');
    expect(result.content).toContain('119');
  });

  it('does not append crisis resources when crisis numbers already present', () => {
    const content =
      'If you need help call 1323. I have been thinking about self-harm.';
    const result = service.filter(content);
    expect(result.flags).not.toContain('crisis_resources_appended');
    expect(result.content).toBe(content);
  });

  it('appends crisis resources when user message contains crisis content', () => {
    const userMessage = 'I want to hurt myself';
    const aiContent = 'I hear you. Here is some support.';
    const result = service.filter(aiContent, userMessage);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags).toContain('crisis_resources_appended');
    expect(result.content).toContain('1323');
  });

  it('truncates content when exceeding max length', () => {
    const longContent =
      'First sentence. Second sentence. Third sentence. ' +
      'A'.repeat(4000);
    const result = service.filter(longContent);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags.some((f) => f.startsWith('response_truncated'))).toBe(
      true,
    );
    expect(result.content.length).toBeLessThanOrEqual(MAX_RESPONSE_LENGTH);
  });

  it('truncates at sentence boundary when possible', () => {
    const sentences = Array.from(
      { length: 100 },
      (_, i) => `This is sentence number ${i + 1}.`,
    ).join(' ');
    const result = service.filter(sentences);
    expect(result.content.endsWith('.')).toBe(true);
  });
});
