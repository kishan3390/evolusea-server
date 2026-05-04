import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import { UserProfileFacade } from '../../domain/user-profile/user-profile.facade';
import { WisdomStoryFacade } from '../../domain/wisdom-story/wisdom-story.facade';
import { WisdomStoryDto } from './dto';
import {
  PaginatedRequestDto,
  Pagination,
} from '../../building-blocks/application';
import {
  ListedWisdomStoryDto,
  ListWisdomStoriesResponseDto,
} from './dto/list-wisdom-stories-response.dto';

@Controller('wisdom-stories')
@RequiredAuth()
export class WisdomStoryController {
  constructor(
    private readonly userProfileFacade: UserProfileFacade,
    private readonly wisdomStoryFacade: WisdomStoryFacade,
  ) {}

  @Get('/:id')
  async getWisdomStory(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<WisdomStoryDto> {
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: authUser.accountId,
    });
    const wisdomStory = await this.wisdomStoryFacade.getWisdomStory({ id });
    if (!wisdomStory) {
      throw new NotFoundException('Wisdom story not found');
    }

    if (!authUser.hasPremiumEntitlement && !wisdomStory.getIsFree()) {
      throw new ForbiddenException(
        'Subscription required to access this story',
      );
    }

    return WisdomStoryDto.fromEntity(wisdomStory, userProfile.getLanguage());
  }

  @Get()
  async listWisdomStories(
    @Query() pagination: PaginatedRequestDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<ListWisdomStoriesResponseDto> {
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: authUser.accountId,
    });
    const wisdomStories = await this.wisdomStoryFacade.listUserWisdomStories({
      pagination: Pagination.from(pagination),
      userProfileId: userProfile.getId(),
      hasPremiumEntitlement: authUser.hasPremiumEntitlement,
    });
    return ListWisdomStoriesResponseDto.from(wisdomStories, (wisdomStory) =>
      ListedWisdomStoryDto.fromEntity(wisdomStory, userProfile.getLanguage()),
    );
  }
}
