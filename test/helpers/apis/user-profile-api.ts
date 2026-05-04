import { CreateUserProfileDto } from '../../../src/http-app/user-profile/dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../../../src/http-app/user-profile/dto/update-user-profile.dto';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { UserProfileDto } from '@domain/user-profile/application';

export function userProfileApi(user: SignedInAccount) {
  return {
    async getMyProfile(): Promise<ApiResponse<UserProfileDto>> {
      return await user.authenticatedRequest.get('/users/me/profile');
    },

    async createMyProfile<ResponseBody = any>(
      dto: CreateUserProfileDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .post('/users/me/profile')
        .send(dto);
    },

    async updateMyProfile<ResponseBody = any>(
      dto: UpdateUserProfileDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.put('/users/me/profile').send(dto);
    },

    async deleteMyProfile<ResponseBody = any>(): Promise<
      ApiResponse<ResponseBody>
    > {
      return await user.authenticatedRequest.delete('/users/me/profile');
    },
  };
}

export type UserProfileAPI = ReturnType<typeof userProfileApi>;
