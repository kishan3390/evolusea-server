import { PromptQuery } from '../../prompt.query';

export interface GetCompassConversationPromptQueryData {
  intention: string;
  turnsCount: number;
}

export type GetCompassConversationPromptQuery =
  PromptQuery<GetCompassConversationPromptQueryData>;
