import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryHandler } from '@building-blocks/application';
import {
  GetUserAchievementsQuery,
  UserAchievementsResult,
  AchievementStatus,
} from './get-user-achievements.query';
import {
  DailyEngagementRepository,
  calculateStreak,
  STREAK_MILESTONES,
  COMPASS_MILESTONES,
  NOTES_MILESTONES,
  PATHS_MILESTONES,
  MOOD_MILESTONES,
  VISION_BOARD_MILESTONES,
  ACCOUNT_MILESTONES,
  AchievementDefinition,
} from '../../../domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';
import { NoteEntity } from '../../../../note/infrastructure/entities/note.entity';
import { CompassChatEntity } from '../../../../compass/infrastructure/entities/compass-chat.entity';
import { PathEntity } from '../../../../path/infrastructure/entities/path.entity';
import { MoodCheckinEntity } from '../../../../mood-checkin/infrastructure/entities/mood-checkin.entity';
import { VisionBoardEntity } from '../../../../vision-board/infrastructure/entities/vision-board.entity';
import { UserProfileEntity } from '../../../../user-profile/infrastructure/entities/user-profile.entity';

@Injectable()
export class GetUserAchievementsQueryHandler
  implements QueryHandler<GetUserAchievementsQuery, UserAchievementsResult>
{
  constructor(
    private readonly dailyEngagementRepository: DailyEngagementRepository,
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    @InjectRepository(CompassChatEntity)
    private readonly compassChatRepository: Repository<CompassChatEntity>,
    @InjectRepository(PathEntity)
    private readonly pathRepository: Repository<PathEntity>,
    @InjectRepository(MoodCheckinEntity)
    private readonly moodCheckinRepository: Repository<MoodCheckinEntity>,
    @InjectRepository(VisionBoardEntity)
    private readonly visionBoardRepository: Repository<VisionBoardEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
  ) {}

  async handle(
    query: GetUserAchievementsQuery,
  ): Promise<UserAchievementsResult> {
    const [
      dates,
      notesCount,
      compassChatsCount,
      pathsCompletedCount,
      moodCheckinsCount,
      visionBoardsCount,
      userProfile,
    ] = await Promise.all([
      this.dailyEngagementRepository.findAllDatesByUserProfileId(
        query.userProfileId,
      ),
      this.noteRepository.count({
        where: { userProfileId: query.userProfileId },
      }),
      this.compassChatRepository.count({
        where: { userProfileId: query.userProfileId },
      }),
      this.pathRepository.count({
        where: {
          userProfileId: query.userProfileId,
          status: 'completed' as never,
        },
      }),
      this.moodCheckinRepository.count({
        where: { userProfileId: query.userProfileId },
      }),
      this.visionBoardRepository.count({
        where: { userProfileId: query.userProfileId },
      }),
      this.userProfileRepository.findOne({
        where: { id: query.userProfileId },
        select: ['createdAt'],
      }),
    ]);

    const today = DateHelpers.getBangkokCurrentDateString();
    const streak = calculateStreak(dates, today);

    const accountAgeDays = userProfile
      ? Math.floor(
          (Date.now() - new Date(userProfile.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    // Build achievement status list
    const achievements: AchievementStatus[] = [];

    const addAchievements = (
      definitions: AchievementDefinition[],
      currentValue: number,
    ) => {
      for (const def of definitions) {
        achievements.push({
          id: def.id,
          category: def.category,
          nameKey: def.nameKey,
          threshold: def.threshold,
          unlocked: currentValue >= def.threshold,
          currentValue,
        });
      }
    };

    addAchievements(STREAK_MILESTONES, streak.bestStreak);
    addAchievements(COMPASS_MILESTONES, compassChatsCount);
    addAchievements(NOTES_MILESTONES, notesCount);
    addAchievements(PATHS_MILESTONES, pathsCompletedCount);
    addAchievements(MOOD_MILESTONES, moodCheckinsCount);
    addAchievements(VISION_BOARD_MILESTONES, visionBoardsCount);
    addAchievements(ACCOUNT_MILESTONES, accountAgeDays);

    return {
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      totalDays: streak.totalDays,
      achievements,
      activityCounts: {
        compassChats: compassChatsCount,
        notes: notesCount,
        pathsCompleted: pathsCompletedCount,
        moodCheckins: moodCheckinsCount,
        visionBoards: visionBoardsCount,
        accountAgeDays,
      },
    };
  }
}
