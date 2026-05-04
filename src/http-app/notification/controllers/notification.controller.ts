import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser, RequiredAuth } from '../../decorators';
import { AuthUser } from '../../authentication';
import {
  RegisterNotificationPushTokenDto,
  UnregisterNotificationPushTokenDto,
} from '../dto';
import { NotificationPushTokenFacade } from '@domain/notification/notification-push-token.facade';

@Controller('users/me/notifications')
@RequiredAuth({
  hasUserProfile: false,
})
export class NotificationController {
  constructor(
    private readonly notificationPushTokenFacade: NotificationPushTokenFacade,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/register-push-token')
  async registerPushToken(
    @Body() payload: RegisterNotificationPushTokenDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<void> {
    await this.notificationPushTokenFacade.registerPushToken({
      accountId: authUser.accountId,
      token: payload.token,
    });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/unregister-push-token')
  async unregisterPushToken(
    @Body() payload: UnregisterNotificationPushTokenDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<void> {
    await this.notificationPushTokenFacade.unregisterPushToken({
      accountId: authUser.accountId,
      token: payload.token,
    });
  }
}
