import { SignedInAccount } from '../../test-app/account/signed-in-account';
import {
  CreateVisionBoardPayloadDto,
  ListVisionBoardsQueryDto,
  ListVisionBoardsResponseDto,
  UpdateVisionBoardPayloadDto,
  VisionBoardDto,
  VisionBoardQuotaDto,
  VisionBoardWithNestedDataDto,
} from '../../../src/http-app/vision-board/dto';
import { ApiResponse } from '../api-response';

export function visionBoardApi(user: SignedInAccount) {
  return {
    async createVisionBoard(
      dto: CreateVisionBoardPayloadDto,
    ): Promise<ApiResponse<VisionBoardDto>> {
      return await user.authenticatedRequest
        .post('/users/me/vision-boards')
        .send(dto);
    },

    async getVisionBoard(
      visionBoardId: string,
    ): Promise<ApiResponse<VisionBoardWithNestedDataDto>> {
      return await user.authenticatedRequest.get(
        `/users/me/vision-boards/${visionBoardId}`,
      );
    },

    async updateVisionBoard(
      visionBoardId: string,
      dto: UpdateVisionBoardPayloadDto,
    ): Promise<ApiResponse<VisionBoardDto>> {
      return await user.authenticatedRequest
        .put(`/users/me/vision-boards/${visionBoardId}`)
        .send(dto);
    },

    async deleteVisionBoard(visionBoardId: string): Promise<ApiResponse<void>> {
      return await user.authenticatedRequest.delete(
        `/users/me/vision-boards/${visionBoardId}`,
      );
    },

    async listVisionBoards(
      query?: ListVisionBoardsQueryDto,
    ): Promise<ApiResponse<ListVisionBoardsResponseDto>> {
      return await user.authenticatedRequest
        .get('/users/me/vision-boards')
        .query({
          ...(query ?? { page: 1, perPage: 10 }),
        });
    },

    async getQuota(): Promise<ApiResponse<VisionBoardQuotaDto>> {
      return await user.authenticatedRequest.get(
        '/users/me/vision-boards/quota',
      );
    },
  };
}

export type VisionBoardAPI = ReturnType<typeof visionBoardApi>;
