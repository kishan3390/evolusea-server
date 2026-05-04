import {
  RegisterNotificationPushTokenDto,
  UnregisterNotificationPushTokenDto,
} from '../../../src/http-app/notification/dto';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';

export function notificationApi(user: SignedInAccount) {
  return {
    async registerPushToken<ResponseBody = any>(
      dto: RegisterNotificationPushTokenDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .post('/users/me/notifications/register-push-token')
        .send(dto);
    },

    async unregisterPushToken<ResponseBody = any>(
      dto: UnregisterNotificationPushTokenDto,
    ): Promise<ApiResponse<ResponseBody>> {
      return await user.authenticatedRequest
        .post('/users/me/notifications/unregister-push-token')
        .send(dto);
    },
  };
}

export type NotificationAPI = ReturnType<typeof notificationApi>;
