import { AiTokenUsageCreateArgs } from '../ai-token-usage';

export abstract class AiTokenUsageRepository {
  abstract create(args: AiTokenUsageCreateArgs): Promise<void>;
  abstract getDailyTotalTokens(userId: string, todayStart: Date): Promise<number>;
}
