import { AiRoleEnum } from '../enums';
import type { AiGenerateParamsMessage } from '../models';
import { AiHelper } from './ai-helper';

describe('AiHelper.mergeSequentialMessagesWithSameRole', () => {
  test('given empty array, returns empty array with no error', () => {
    expect(AiHelper.mergeSequentialMessagesWithSameRole([])).toEqual([]);
  });

  test('given single message, returns unchanged message as new object', () => {
    const input: AiGenerateParamsMessage[] = [
      { role: AiRoleEnum.User, content: 'Hello' },
    ];

    const output = AiHelper.mergeSequentialMessagesWithSameRole(input);

    expect(output).toHaveLength(1);
    expect(output[0]).toEqual(input[0]); // value equal
    expect(output[0]).not.toBe(input[0]); // not the same reference
  });

  test('given two messages with same sequential role, merges messages', () => {
    const input: AiGenerateParamsMessage[] = [
      { role: AiRoleEnum.User, content: 'Hello' },
      { role: AiRoleEnum.User, content: 'world!' },
    ];

    const output = AiHelper.mergeSequentialMessagesWithSameRole(input);

    expect(output).toEqual([
      { role: AiRoleEnum.User, content: 'Hello world!' },
    ]);
  });

  test('given more than two sequential messages with same role, merges them into one message', () => {
    const input: AiGenerateParamsMessage[] = [
      { role: AiRoleEnum.User, content: 'one' },
      { role: AiRoleEnum.User, content: 'two' },
      { role: AiRoleEnum.User, content: 'three' },
    ];

    const output = AiHelper.mergeSequentialMessagesWithSameRole(input);

    expect(output).toEqual([
      { role: AiRoleEnum.User, content: 'one two three' },
    ]);
  });

  test('given multiple message with different sequential roles, does not merge messages when roles alternate', () => {
    const input: AiGenerateParamsMessage[] = [
      { role: AiRoleEnum.User, content: 'Q1' },
      { role: AiRoleEnum.Assistant, content: 'A1' },
      { role: AiRoleEnum.User, content: 'Q2' },
      { role: AiRoleEnum.Assistant, content: 'A2' },
    ];

    const output = AiHelper.mergeSequentialMessagesWithSameRole(input);

    expect(output).toEqual(input.map((m) => ({ ...m })));
  });

  test('given multiple message with same sequential roles, merges messages and preserves order', () => {
    const input: AiGenerateParamsMessage[] = [
      { role: AiRoleEnum.Assistant, content: 'Part 1' },
      { role: AiRoleEnum.Assistant, content: 'and 2' },
      { role: AiRoleEnum.User, content: 'Now' },
      { role: AiRoleEnum.User, content: 'your turn' },
      { role: AiRoleEnum.User, content: 'again' },
      { role: AiRoleEnum.Assistant, content: 'Final' },
    ];

    const output = AiHelper.mergeSequentialMessagesWithSameRole(input);

    expect(output).toEqual([
      { role: AiRoleEnum.Assistant, content: 'Part 1 and 2' },
      { role: AiRoleEnum.User, content: 'Now your turn again' },
      { role: AiRoleEnum.Assistant, content: 'Final' },
    ]);
  });

  test('given multiple messages, does not mutate the input array or its message objects', () => {
    const input: AiGenerateParamsMessage[] = [
      { role: AiRoleEnum.User, content: 'A' },
      { role: AiRoleEnum.User, content: 'B' },
      { role: AiRoleEnum.Assistant, content: 'C' },
    ];
    const snapshot = JSON.parse(JSON.stringify(input));

    const output = AiHelper.mergeSequentialMessagesWithSameRole(input);

    // input unchanged
    expect(input).toEqual(snapshot);
    // output is a new array with new objects
    expect(output).not.toBe(input);
    output.forEach((msg, i) => {
      // the first run merges, so index mapping changes; just ensure no output item reuses the same ref
      expect(input).not.toContain(msg);
    });
  });
});
