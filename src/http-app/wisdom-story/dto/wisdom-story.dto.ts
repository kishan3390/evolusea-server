import { Languages } from '../../../domain/user-profile/domain';
import {
  WisdomStory,
  WisdomStoryTimeToRead,
} from '../../../domain/wisdom-story/domain';

export class WisdomStoryDto {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  timeToRead: WisdomStoryTimeToRead;
  isFree: boolean;
  reflectionPrompt: string | null;
  themes: string[];

  static fromEntity(entity: WisdomStory, language: Languages): WisdomStoryDto {
    const translation =
      entity.getTranslation(language) ??
      entity.getTranslation(Languages.English);
    return {
      id: entity.getId(),
      title: translation?.getTitle() ?? '',
      content: translation?.getContent() ?? '',
      imageUrl: entity.getImageUrl(),
      timeToRead: entity.getTimeToRead(),
      isFree: entity.getIsFree(),
      reflectionPrompt: null,
      themes: [],
    };
  }
}
