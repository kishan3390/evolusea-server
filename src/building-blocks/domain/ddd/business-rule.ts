export interface SyncBusinessRule {
  isBroken(): boolean;
  getMessage(): string;
  getData?(): Record<string, any>;
}

export interface AsyncBusinessRule {
  isBroken(): Promise<boolean> | boolean;
  getMessage(): string;
  getData?(): Record<string, any>;
}
