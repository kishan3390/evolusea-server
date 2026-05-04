import { MessageData } from '../../../domain';

export interface SendNotificationToUserCommand {
  accountId: string;
  title: string;
  body: string;
  data?: MessageData;
}
