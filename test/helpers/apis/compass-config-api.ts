import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { CreateCompassConfigDto } from '../../../src/http-app/compass/dto/create-compass-config.dto';
import { UpdateCompassConfigDto } from '../../../src/http-app/compass/dto/update-compass-config.dto';

export function compassConfigApi(user: SignedInAccount) {
  return {
    async createCompassConfig<ResponseBody = any>(
      dto: CreateCompassConfigDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .post('/users/me/compass/config')
        .send(dto);
    },

    async getCompassConfig<ResponseBody = any>(): Promise<
      ApiResponse<ResponseBody>
    > {
      return await user.authenticatedRequest.get(`/users/me/compass/config`);
    },

    async updateCompassConfig<ResponseBody = any>(
      dto: UpdateCompassConfigDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .put('/users/me/compass/config')
        .send(dto);
    },
  };
}

export type CompassConfigAPI = ReturnType<typeof compassConfigApi>;
