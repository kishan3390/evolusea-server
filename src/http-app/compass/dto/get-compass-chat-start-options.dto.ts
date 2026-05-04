import { IsDateString } from 'class-validator';

export class GetCompassChatStartOptionsQueryDto {
  @IsDateString()
  date: string;
}
