import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../building-blocks/application';
import {
  WisdomStory,
  WisdomStoryTimeToRead,
} from '../../../domain/wisdom-story/domain';
import { Languages } from '../../../domain/user-profile/domain';

export class ListedWisdomStoryDto {
  id: string;
  title: string;
  imageUrl: string | null;
  timeToRead: WisdomStoryTimeToRead;
  isFree: boolean;

  static fromEntity(
    entity: WisdomStory,
    language: Languages,
  ): ListedWisdomStoryDto {
    const translation =
      entity.getTranslation(language) ??
      entity.getTranslation(Languages.English);
    return {
      id: entity.getId(),
      title: translation?.getTitle() ?? '', // in case story has no translations at all (unlikely)
      imageUrl: entity.getImageUrl(),
      timeToRead: entity.getTimeToRead(),
      isFree: entity.getIsFree(),
    };
  }
}

export class ListWisdomStoriesResponseDto extends PaginatedResponseDto<ListedWisdomStoryDto> {
  @ApiProperty({ type: [ListedWisdomStoryDto] })
  declare items: ListedWisdomStoryDto[];
}
