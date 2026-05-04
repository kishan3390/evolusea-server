import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { SendCompassChatMessagePayloadDto } from '../../../src/http-app/compass/dto/send-compass-chat-message.dto';
import { SendCompassChatMessagePlaygroundPayloadDto } from '../../../src/http-app/compass/dto/send-compass-chat-message-playground.dto';
import { PaginatedRequestDto } from '@building-blocks/application';
import { ListCompassChatsResponseDto } from '../../../src/http-app/compass/dto/list-compass-chats-response.dto';

export function compassChatMessageApi(user: SignedInAccount) {
  return {
    async sendCompassChatMessage<ResponseBody = any>(
      compassChatId: string,
      dto: SendCompassChatMessagePayloadDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .post(`/users/me/compass/chats/${compassChatId}/messages/send`)
        .send(dto);
    },

    async sendCompassChatMessagePlayground<ResponseBody = any>(
      compassChatId: string,
      dto: SendCompassChatMessagePlaygroundPayloadDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .post(
          `/playground/users/me/compass/chats/${compassChatId}/messages/send`,
        )
        .send(dto);
    },

    async listCompassChatMessages(
      compassChatId: string,
      pagination?: PaginatedRequestDto,
    ): Promise<ApiResponse<ListCompassChatsResponseDto>> {
      return await user.authenticatedRequest
        .get(`/users/me/compass/chats/${compassChatId}/messages`)
        .query({
          ...(pagination ?? { page: 1, perPage: 10 }),
        });
    },
  };
}

export type CompassChatMessageAPI = ReturnType<typeof compassChatMessageApi>;
