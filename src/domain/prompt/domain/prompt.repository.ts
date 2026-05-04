import { PromptType } from './enums';

export abstract class PromptRepository {
  abstract getPrompt(
    promptType: PromptType,
    args: Record<string, any>,
    promptOverride?: string,
  ): string;
}
