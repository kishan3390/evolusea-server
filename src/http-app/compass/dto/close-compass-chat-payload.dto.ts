import { IsUUID } from 'class-validator';

export class CloseCompassChatPayloadDto {
  @IsUUID()
  compassChatId: string;
}
