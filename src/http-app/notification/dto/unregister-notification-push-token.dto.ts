import { IsNotEmpty, IsString } from 'class-validator';

export class UnregisterNotificationPushTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
