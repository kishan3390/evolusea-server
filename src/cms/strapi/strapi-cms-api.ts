import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { CmsApi, CmsWisdomStory, CmsWisdomStoryLocale } from '../cms-api';
import { ConfigProvider } from '@config';
import {
  StrapiWisdomStoryResponse,
  StrapiWisdomStoryResponseSchema,
} from './strapi-schemas';
import { WisdomStoryBeliefSystems } from '@domain/wisdom-story/domain';

@Injectable()
export class StrapiCmsApi implements CmsApi {
  private readonly apiUrl = ConfigProvider.strapi.url;
  private readonly apiToken = ConfigProvider.strapi.apiToken;
  private readonly pageSize = 100;
  logger: LoggerService;

  constructor() {
    this.logger = new Logger(StrapiCmsApi.name);
  }

  async fetchWisdomStories(): Promise<CmsWisdomStory[]> {
    const wisdomStories: CmsWisdomStory[] = [];
    let hasMore = true;
    let page = 1;

    while (hasMore) {
      const data = await this.fetchWisdomStoriesPage(page);
      const mappedStories = this.mapStrapiStoriesToCmsStories(
        data.wisdomStories,
      );

      wisdomStories.push(...mappedStories);
      hasMore = data.pagination.hasMore;
      page++;
    }

    return wisdomStories;
  }

  private async fetchWisdomStoriesPage(
    page: number,
  ): Promise<StrapiWisdomStoryResponse> {
    const url = `${this.apiUrl}/api/wisdom-stories?page=${page}&perPage=${this.pageSize}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch wisdom stories from CMS: ${response.statusText}`,
      );
      throw new Error(
        `Failed to fetch wisdom stories from CMS: ${response.statusText}`,
      );
    }

    const rawData = await response.json();
    const parseResult = StrapiWisdomStoryResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      this.logger.error(
        'Invalid response format from CMS:',
        parseResult.error.format(),
      );
      throw new Error(
        `Invalid response format from CMS: ${parseResult.error.message}`,
      );
    }

    return parseResult.data;
  }

  private mapStrapiStoriesToCmsStories(
    strapiStories: StrapiWisdomStoryResponse['wisdomStories'],
  ): CmsWisdomStory[] {
    return strapiStories.map((story) => ({
      id: story.id,
      timeToRead: story.timeToRead,
      isFree: story.free,
      image: story.image,
      mood: story.mood,
      beliefSystem: this.normalizeBeliefSystem(story.beliefSystem),
      createdAt: new Date(story.createdAt),
      locales: story.locales.map(
        (locale): CmsWisdomStoryLocale => ({
          locale: locale.locale,
          title: locale.title,
          content: locale.content,
        }),
      ),
    }));
  }

  private normalizeBeliefSystem(
    value: string,
  ): WisdomStoryBeliefSystems {
    if (value === 'other/general' || value === 'general/other') {
      return WisdomStoryBeliefSystems.General;
    }
    return value as WisdomStoryBeliefSystems;
  }
}
