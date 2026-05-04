import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterNotificationPushTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
