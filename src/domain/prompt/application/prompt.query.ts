export interface PromptQuery<T extends Record<string, any>> {
  data: T
  promptOverride?: string;
}