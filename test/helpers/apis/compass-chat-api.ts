import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { StartCompassChatPayloadDto } from '../../../src/http-app/compass/dto/start-compass-chat.dto';
import { StartCompassChatPlaygroundPayloadDto } from '../../../src/http-app/compass/dto/start-compass-chat-playground.dto';
import { ListCompassChatsQueryDto } from '../../../src/http-app/compass/dto/list-compass-chats-query.dto';
import { GetCompassChatQueryDto } from '../../../src/http-app/compass/dto/get-compass-chat-query.dto';
import { CloseCompassChatPayloadDto } from '../../../src/http-app/compass/dto/close-compass-chat-payload.dto';
import { CompassChatWithMessageDto } from '../../../src/http-app/compass/dto/compass-chat-with-messages.dto';
import { CompassChatStartOptionsDto } from '../../../src/http-app/compass/dto/compass-chat-start-options.dto';
import { GetCompassChatStartOptionsQueryDto } from '../../../src/http-app/compass/dto/get-compass-chat-start-options.dto';
import { CompassChatsQuotaDto } from '../../../src/http-app/compass/dto/compass-chats-quota.dto';

export function compassChatApi(user: SignedInAccount) {
  return {
    async startCompassChat(
      dto: StartCompassChatPayloadDto,
    ): Promise<ApiResponse<CompassChatWithMessageDto>> {
      return await user.authenticatedRequest
        .post('/users/me/compass/chats/start')
        .send(dto);
    },

    async closeCompassChat(
      dto: CloseCompassChatPayloadDto,
    ): Promise<ApiResponse<CompassChatWithMessageDto>> {
      return await user.authenticatedRequest
        .post('/users/me/compass/chats/close')
        .send(dto);
    },

    async startCompassChatPlayground(
      dto: StartCompassChatPlaygroundPayloadDto,
    ): Promise<ApiResponse<CompassChatWithMessageDto>> {
      return await user.authenticatedRequest
        .post('/playground/users/me/compass/chats/start')
        .send(dto);
    },

    async listCompassChats<ResponseBody = any>(
      dto?: ListCompassChatsQueryDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .get('/users/me/compass/chats')
        .query(dto ?? {});
    },

    async getCompassChat(
      compassChatId: string,
      query?: GetCompassChatQueryDto,
    ): Promise<ApiResponse<CompassChatWithMessageDto>> {
      return await user.authenticatedRequest
        .get(`/users/me/compass/chats/${compassChatId}`)
        .query(query ?? {});
    },

    async getCompassChatStartOptions(
      query: GetCompassChatStartOptionsQueryDto,
    ): Promise<ApiResponse<CompassChatStartOptionsDto>> {
      return await user.authenticatedRequest
        .get(`/users/me/compass/chats/start/options`)
        .query(query ?? {});
    },

    async getCompassChatsQuota(): Promise<ApiResponse<CompassChatsQuotaDto>> {
      return user.authenticatedRequest.get('/users/me/compass/chats/quota');
    },
  };
}

export type CompassChatAPI = ReturnType<typeof compassChatApi>;
