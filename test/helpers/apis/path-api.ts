import {
  CreatePathPayloadDto,
  ListPathsQueryDto,
  ListPathsResponseDto,
  PathDto,
  PathsQuotaDto,
  UpdatePathPayloadDto,
} from '../../../src/http-app/path/dto';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';

export function pathApi(user: SignedInAccount) {
  return {
    async createPath(dto: CreatePathPayloadDto): Promise<ApiResponse<PathDto>> {
      return await user.authenticatedRequest.post('/users/me/paths').send(dto);
    },

    async getPath<ResponseBody = any>(
      pathId: string,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.get(`/users/me/paths/${pathId}`);
    },

    async deletePath<ResponseBody = any>(
      pathId: string,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.delete(
        `/users/me/paths/${pathId}`,
      );
    },

    async updatePath<ResponseBody = any>(
      pathId: string,
      dto: UpdatePathPayloadDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .put(`/users/me/paths/${pathId}`)
        .send(dto);
    },

    async listPaths<ResponseBody = any>(
      query?: ListPathsQueryDto,
    ): Promise<ApiResponse<ListPathsResponseDto>> {
      return await user.authenticatedRequest.get('/users/me/paths').query({
        ...(query ?? { page: 1, perPage: 10 }),
      });
    },

    async completePath<ResponseBody = any>(
      pathId: string,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.post(
        `/users/me/paths/${pathId}/complete`,
      );
    },

    async restorePath<ResponseBody = any>(
      pathId: string,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.post(
        `/users/me/paths/${pathId}/restore`,
      );
    },

    async getPathsQuota(): Promise<ApiResponse<PathsQuotaDto>> {
      return await user.authenticatedRequest.get(`/users/me/paths/quota`);
    },
  };
}

export type PathAPI = ReturnType<typeof pathApi>;
