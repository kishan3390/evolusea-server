import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendCompassChatMessagePayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2_000)
  content: string;
}
