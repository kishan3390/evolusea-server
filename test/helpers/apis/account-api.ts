import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';
import { AccountEntitlementsRefreshDto } from '../../../src/http-app/account/dto/account-entitlements-refresh.dto';

export function accountApi(user: SignedInAccount) {
  return {
    async syncMyAuth<ResponseBody = any>(): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest.post('/accounts/me/sync');
    },

    async syncMyEntitlements(): Promise<
      ApiResponse<AccountEntitlementsRefreshDto>
    > {
      return await user.authenticatedRequest.post(
        '/accounts/me/entitlements/sync',
      );
    },

    async deleteMyAccount(): Promise<ApiResponse<void>> {
      return await user.authenticatedRequest.delete('/accounts/me');
    },
  };
}

export type AccountAPI = ReturnType<typeof accountApi>;
