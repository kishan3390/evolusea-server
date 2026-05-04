import { Injectable } from '@nestjs/common';
import { CompassChatMessage } from '@domain/compass/domain/compass-chat-message';
import {
  CompassChatMessageVisibility,
  CompassChatSpeaker,
} from '@domain/compass/domain';
import { CompassIntentions } from '@domain/compass/domain/enums/compass-intentions.enum';
import { AiRoleEnum } from '../../../../ai';

/**
 * Configuration for conversation history windowing.
 */
const WINDOW_CONFIG = {
  /** Always include the last N messages (recent window) */
  recentMessageCount: 8,
  /** Start windowing after this many turns (user exchanges) */
  summarizeAfterTurn: 6,
  /** Max chars for the older messages summary */
  maxOlderUserChars: 600,
  /** Max chars for the older AI guidance summary */
  maxOlderAiChars: 400,
  /** Max chars to take from each individual older message */
  perMessageCharLimit: 250,
  /** Max older user messages to include in summary */
  maxOlderUserMessages: 6,
  /** Max older AI messages to include in summary */
  maxOlderAiMessages: 3,
};

export interface WindowedMessages {
  /** Messages to send to the AI (windowed) */
  messages: CompassChatMessage[];
  /** Whether windowing was applied */
  wasWindowed: boolean;
}

@Injectable()
export class CompassConversationWindowingService {
  /**
   * Applies conversation history windowing.
   *
   * For turns 1-4: returns all messages as-is.
   * For turns 5+: returns system prompt + summary of older messages + last 6 messages.
   *
   * @param messages All messages in the conversation, sorted by createdAt ASC
   * @param turnsCount Current turn count of the conversation
   * @param intention Optional compass intention to include in the windowed summary
   */
  applyWindowing(
    messages: CompassChatMessage[],
    turnsCount: number,
    intention?: CompassIntentions,
  ): WindowedMessages {
    if (turnsCount <= WINDOW_CONFIG.summarizeAfterTurn) {
      return { messages, wasWindowed: false };
    }

    // Separate the system prompt (first message, role=System) from conversation messages
    const systemMessages: CompassChatMessage[] = [];
    const conversationMessages: CompassChatMessage[] = [];

    for (const msg of messages) {
      if (
        msg.getRole() === AiRoleEnum.System &&
        msg.getVisibility() === CompassChatMessageVisibility.Internal
      ) {
        systemMessages.push(msg);
      } else {
        conversationMessages.push(msg);
      }
    }

    // If we don't have enough conversation messages to window, return as-is
    if (conversationMessages.length <= WINDOW_CONFIG.recentMessageCount) {
      return { messages, wasWindowed: false };
    }

    // Split into "older" and "recent"
    const cutoff =
      conversationMessages.length - WINDOW_CONFIG.recentMessageCount;
    const olderMessages = conversationMessages.slice(0, cutoff);
    const recentMessages = conversationMessages.slice(cutoff);

    // Build application-level summary of older messages (no AI call needed)
    const summary = this.buildOlderMessagesSummary(olderMessages, intention);

    // Create a synthetic internal message containing the summary
    const summaryMessage = CompassChatMessage.createFromProps({
      id: 'windowed-summary',
      compassChatId: messages[0]?.getCompassChatId() ?? '',
      role: AiRoleEnum.User,
      speaker: CompassChatSpeaker.System,
      content: summary,
      visibility: CompassChatMessageVisibility.Internal,
      turnIndex: 0,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Build windowed messages: system messages + summary + recent conversation
    const windowedMessages = [
      ...systemMessages,
      summaryMessage,
      ...recentMessages,
    ];

    return { messages: windowedMessages, wasWindowed: true };
  }

  /**
   * Builds a semantic summary of older messages without making an AI call.
   * Labels messages by their conversational role for better context retention.
   */
  private buildOlderMessagesSummary(
    olderMessages: CompassChatMessage[],
    intention?: CompassIntentions,
  ): string {
    const userMessages = olderMessages
      .filter(
        (m) =>
          m.getSpeaker() === CompassChatSpeaker.User &&
          m.getVisibility() === CompassChatMessageVisibility.Public,
      )
      .slice(-WINDOW_CONFIG.maxOlderUserMessages)
      .map((m) =>
        m.getContent().substring(0, WINDOW_CONFIG.perMessageCharLimit),
      );

    const aiMessages = olderMessages
      .filter(
        (m) =>
          m.getSpeaker() === CompassChatSpeaker.System &&
          m.getVisibility() === CompassChatMessageVisibility.Public,
      )
      .slice(-WINDOW_CONFIG.maxOlderAiMessages)
      .map((m) =>
        m.getContent().substring(0, WINDOW_CONFIG.perMessageCharLimit),
      );

    const parts: string[] = [
      '[Context from earlier in this conversation — use this to maintain continuity]',
    ];

    if (intention) {
      parts.push(`[Active intention: ${intention}]`);
    }

    // Label the first user message as their core concern for better context
    if (userMessages.length > 0) {
      const coreConcern = userMessages[0]
        .substring(0, WINDOW_CONFIG.maxOlderUserChars);
      parts.push(`User's core concern: ${coreConcern}`);

      if (userMessages.length > 1) {
        const followUp = userMessages
          .slice(1)
          .join(' | ')
          .substring(0, WINDOW_CONFIG.maxOlderUserChars - coreConcern.length);
        parts.push(`User also shared: ${followUp}`);
      }
    }

    if (aiMessages.length > 0) {
      const guidanceSummary = aiMessages
        .join(' | ')
        .substring(0, WINDOW_CONFIG.maxOlderAiChars);
      parts.push(`Guidance already offered: ${guidanceSummary}`);
    }

    return parts.join('\n');
  }
}
