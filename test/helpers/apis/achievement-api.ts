import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import {
  JourneySummaryDto,
  UserAchievementsDto,
} from '../../../src/http-app/achievement/dto';

export function achievementApi(user: SignedInAccount) {
  return {
    async getJourneySummary(): Promise<ApiResponse<JourneySummaryDto>> {
      return await user.authenticatedRequest.get(
        '/users/me/achievements/summary',
      );
    },

    async getUserAchievements(): Promise<ApiResponse<UserAchievementsDto>> {
      return await user.authenticatedRequest.get('/users/me/achievements');
    },
  };
}

export type AchievementAPI = ReturnType<typeof achievementApi>;
