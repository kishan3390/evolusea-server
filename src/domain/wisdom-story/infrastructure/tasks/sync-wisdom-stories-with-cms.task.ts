import { Injectable, Logger } from '@nestjs/common';
import { CmsApi, CmsWisdomStory } from '../../../../cms';
import { DistributedLockService } from '../../../../distributed-lock';
import {
  WisdomStory,
  WisdomStoryRepository,
  WisdomStoryTimeToRead,
} from '../../domain';
import { Cron } from '@nestjs/schedule';
import { EntityIdGenerator } from '@building-blocks/domain';
import { WisdomStoryTranslation } from '../../domain/wisdom-story-translation';
import { Languages } from '@domain/user-profile/domain';
import { Moods } from '@domain/note/domain/enums';
import { ConfigProvider } from '@config';

const LOCK_KEY = 'sync-wisdom-stories-with-cms-task-lock';
const LOCK_EXPIRATION_TIME = 5 * 60_000; // 5 minutes

@Injectable()
export class SyncWisdomStoriesWithCmsTask {
  private readonly logger = new Logger(SyncWisdomStoriesWithCmsTask.name);

  constructor(
    private readonly distributedLock: DistributedLockService,
    private readonly wisdomStoryRepository: WisdomStoryRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly cmsApi: CmsApi,
  ) {}

  @Cron(ConfigProvider.domain.wisdomStory.strapiSyncCron, {
    timeZone: ConfigProvider.domain.wisdomStory.strapiSyncTimezone,
  })
  async execute(): Promise<void> {
    this.logger.log(
      '[CRON] Trying to acquire lock to sync wisdom stories with CMS...',
    );
    await this.distributedLock.executeWithLock(
      LOCK_KEY,
      LOCK_EXPIRATION_TIME,
      () => this.syncWisdomStoriesWithCms(),
    );
  }

  private async syncWisdomStoriesWithCms(): Promise<void> {
    this.logger.log('[CRON] Syncing wisdom stories with CMS...');

    const [cmsWisdomStories, existingStories] = await Promise.all([
      this.cmsApi.fetchWisdomStories(),
      this.wisdomStoryRepository.findAll(),
    ]);

    const existingStoriesByCmsId = new Map(
      existingStories.map((story) => [story.getProps().CMSId, story]),
    );

    const cmsStoryIds = new Set(cmsWisdomStories.map((story) => story.id));

    await this.createOrUpdateStories(cmsWisdomStories, existingStoriesByCmsId);

    await this.removeDeletedStories(existingStories, cmsStoryIds);

    this.logger.log('[CRON] Completed syncing wisdom stories with CMS.');
  }

  private async createOrUpdateStories(
    cmsWisdomStories: CmsWisdomStory[],
    existingStoriesByCmsId: Map<string, WisdomStory>,
  ): Promise<void> {
    for (const cmsStory of cmsWisdomStories) {
      try {
        const existingStory = existingStoriesByCmsId.get(cmsStory.id);
        if (existingStory) {
          await this.updateStory(existingStory, cmsStory);
        } else {
          await this.createStory(cmsStory);
        }
      } catch (e) {
        this.logger.error(
          `Failed to sync wisdom story with CMS ID ${cmsStory.id}: ${e.toString()}`,
        );
      }
    }
  }

  private async createStory(cmsStory: CmsWisdomStory): Promise<void> {
    const story = WisdomStory.create({
      CMSId: cmsStory.id,
      imageUrl: cmsStory.image,
      timeToRead: cmsStory.timeToRead as WisdomStoryTimeToRead,
      mood: cmsStory.mood as Moods,
      beliefSystem: cmsStory.beliefSystem,
      isFree: cmsStory.isFree,
      entityIdGenerator: this.entityIdGenerator,
      createdAtCMS: cmsStory.createdAt,
    });

    for (const locale of cmsStory.locales) {
      const translation = WisdomStoryTranslation.create({
        wisdomStoryId: story.getId(),
        title: locale.title,
        content: locale.content,
        language: locale.locale as Languages,
        entityIdGenerator: this.entityIdGenerator,
      });
      story.addTranslation(translation);
    }

    await this.wisdomStoryRepository.create(story);
    this.logger.log(`Created new wisdom story with CMS ID: ${cmsStory.id}`);
  }

  private async updateStory(
    existingStory: WisdomStory,
    cmsStory: CmsWisdomStory,
  ): Promise<void> {
    const wasStoryUpdated = existingStory.update({
      imageUrl: cmsStory.image,
      timeToRead: cmsStory.timeToRead as WisdomStoryTimeToRead,
      mood: cmsStory.mood as Moods,
      beliefSystem: cmsStory.beliefSystem,
      isFree: cmsStory.isFree,
    });
    const wereTranslationsUpdated = existingStory.updateTranslations(
      cmsStory.locales.map((locale) => ({
        language: locale.locale as Languages,
        title: locale.title,
        content: locale.content,
      })),
      this.entityIdGenerator,
    );
    if (wasStoryUpdated || wereTranslationsUpdated) {
      await this.wisdomStoryRepository.update(existingStory);
      this.logger.log(`Updated wisdom story with CMS ID: ${cmsStory.id}`);
      return;
    }
  }

  private async removeDeletedStories(
    existingStories: WisdomStory[],
    cmsStoryIds: Set<string>,
  ): Promise<void> {
    for (const existingStory of existingStories) {
      const cmsId = existingStory.getProps().CMSId;
      if (!cmsStoryIds.has(cmsId)) {
        try {
          await this.wisdomStoryRepository.delete(existingStory.getId());
          this.logger.log(
            `Deleted wisdom story that no longer exists in CMS: ${cmsId}`,
          );
        } catch (e) {
          this.logger.error(
            `Failed to delete wisdom story with CMS ID ${cmsId}: ${e.toString()}`,
          );
        }
      }
    }
  }
}
