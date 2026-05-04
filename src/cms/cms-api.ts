import { WisdomStoryBeliefSystems } from '@domain/wisdom-story/domain';

export interface CmsWisdomStoryLocale {
  locale: string;
  title: string;
  content: string;
}

export interface CmsWisdomStory {
  id: string;
  timeToRead: string;
  isFree: boolean;
  mood: string;
  beliefSystem: WisdomStoryBeliefSystems;
  image: string | null;
  createdAt: Date;
  locales: CmsWisdomStoryLocale[];
}

export abstract class CmsApi {
  abstract fetchWisdomStories(): Promise<CmsWisdomStory[]>;
}
