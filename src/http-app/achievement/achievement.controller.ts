import { Controller, Get } from '@nestjs/common';
import { CurrentUser, RequiredAuth } from '../decorators';
import { AuthUser } from '../authentication';
import { AchievementFacade } from '@domain/achievement/achievement.facade';
import { JourneySummaryDto, UserAchievementsDto } from './dto';

@Controller('users/me/achievements')
@RequiredAuth()
export class AchievementController {
  constructor(private readonly achievementFacade: AchievementFacade) {}

  @Get('/summary')
  async getJourneySummary(
    @CurrentUser() authUser: AuthUser,
  ): Promise<JourneySummaryDto> {
    const result = await this.achievementFacade.getUserJourneySummary({
      userProfileId: authUser.userProfileId,
    });
    return JourneySummaryDto.fromResult(result);
  }

  @Get()
  async getUserAchievements(
    @CurrentUser() authUser: AuthUser,
  ): Promise<UserAchievementsDto> {
    const result = await this.achievementFacade.getUserAchievements({
      userProfileId: authUser.userProfileId,
    });
    return UserAchievementsDto.fromResult(result);
  }
}
