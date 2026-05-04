import { describe, it, expect } from 'vitest';
import { CompassConversationWindowingService } from './compass-conversation-windowing.service';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';
import {
  CompassChatMessageVisibility,
  CompassChatSpeaker,
} from '@domain/compass/domain';
import { AiRoleEnum } from '../../../../ai';

describe('CompassConversationWindowingService', () => {
  let service: CompassConversationWindowingService;

  beforeEach(() => {
    service = new CompassConversationWindowingService();
  });

  const createMessage = (
    overrides: Partial<{
      id: string;
      compassChatId: string;
      role: AiRoleEnum;
      speaker: CompassChatSpeaker;
      content: string;
      visibility: CompassChatMessageVisibility;
      turnIndex: number;
    }> = {},
  ) =>
    CompassChatMessage.createFromProps({
      id: overrides.id ?? 'msg-1',
      compassChatId: overrides.compassChatId ?? 'chat-1',
      role: overrides.role ?? AiRoleEnum.User,
      speaker: overrides.speaker ?? CompassChatSpeaker.User,
      content: overrides.content ?? 'Hi',
      visibility: overrides.visibility ?? CompassChatMessageVisibility.Public,
      turnIndex: overrides.turnIndex ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

  it('returns all messages as-is when turnsCount <= 6', () => {
    const messages = [
      createMessage({ id: '1', content: 'M1' }),
      createMessage({ id: '2', content: 'M2' }),
    ];

    const result = service.applyWindowing(messages, 2);
    expect(result.wasWindowed).toBe(false);
    expect(result.messages).toEqual(messages);
  });

  it('returns all messages as-is when turnsCount is 6', () => {
    const messages = [
      createMessage({ id: '1', content: 'M1' }),
      createMessage({ id: '2', content: 'M2' }),
    ];
    const result = service.applyWindowing(messages, 6);
    expect(result.wasWindowed).toBe(false);
    expect(result.messages).toEqual(messages);
  });

  it('returns as-is when conversation messages <= 8 even with turnsCount > 6', () => {
    const systemMsg = createMessage({
      id: 'sys',
      role: AiRoleEnum.System,
      speaker: CompassChatSpeaker.System,
      visibility: CompassChatMessageVisibility.Internal,
    });
    const convMsgs = Array.from({ length: 7 }, (_, i) =>
      createMessage({ id: `m${i}`, content: `Content ${i}` }),
    );
    const messages = [systemMsg, ...convMsgs];

    const result = service.applyWindowing(messages, 7);
    expect(result.wasWindowed).toBe(false);
    expect(result.messages).toEqual(messages);
  });

  it('applies windowing when turnsCount > 6 and more than 8 conversation messages', () => {
    const systemMsg = createMessage({
      id: 'sys',
      role: AiRoleEnum.System,
      speaker: CompassChatSpeaker.System,
      visibility: CompassChatMessageVisibility.Internal,
    });
    const convMsgs = Array.from({ length: 14 }, (_, i) =>
      createMessage({
        id: `m${i}`,
        content: `User said something or AI replied with guidance. Message ${i}.`,
        speaker: i % 2 === 0 ? CompassChatSpeaker.User : CompassChatSpeaker.System,
      }),
    );
    const messages = [systemMsg, ...convMsgs];

    const result = service.applyWindowing(messages, 7);

    expect(result.wasWindowed).toBe(true);
    expect(result.messages.length).toBeLessThan(messages.length);
    expect(result.messages[0]).toBe(systemMsg);
    expect(result.messages[1].getContent()).toContain(
      '[Context from earlier in this conversation',
    );
    expect(result.messages[1].getRole()).toBe(AiRoleEnum.User);
    expect(result.messages[1].getVisibility()).toBe(
      CompassChatMessageVisibility.Internal,
    );
    expect(result.messages.slice(2)).toHaveLength(8);
  });

  it('includes only recent 8 conversation messages in windowed output', () => {
    const systemMsg = createMessage({
      id: 'sys',
      role: AiRoleEnum.System,
      speaker: CompassChatSpeaker.System,
      visibility: CompassChatMessageVisibility.Internal,
    });
    const convMsgs = Array.from({ length: 16 }, (_, i) =>
      createMessage({
        id: `m${i}`,
        content: `Msg${i}`,
        speaker: CompassChatSpeaker.User,
      }),
    );
    const messages = [systemMsg, ...convMsgs];

    const result = service.applyWindowing(messages, 8);

    expect(result.wasWindowed).toBe(true);
    const recentStart = result.messages.findIndex(
      (m) => m.getContent() === 'Msg8',
    );
    expect(recentStart).toBeGreaterThanOrEqual(0);
    const recent = result.messages.slice(recentStart);
    expect(recent.map((m) => m.getContent())).toEqual([
      'Msg8',
      'Msg9',
      'Msg10',
      'Msg11',
      'Msg12',
      'Msg13',
      'Msg14',
      'Msg15',
    ]);
  });
});
