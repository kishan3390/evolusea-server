import { PaginatedRequestDto } from '../../../src/building-blocks/application';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { ListWisdomStoriesResponseDto } from '../../../src/http-app/wisdom-story/dto';

export function wisdomStoryApi(user: SignedInAccount) {
  return {
    async getWisdomStory<ResponseBody = any>(
      id: string,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .get(`/wisdom-stories/${id}`)
        .send();
    },

    async listWisdomStories(
      pagination?: PaginatedRequestDto,
    ): Promise<ApiResponse<ListWisdomStoriesResponseDto>> {
      return await user.authenticatedRequest.get(`/wisdom-stories`).query({
        ...(pagination ?? { page: 1, perPage: 10 }),
      });
    },
  };
}

export type WisdomStoryAPI = ReturnType<typeof wisdomStoryApi>;
