import { AiGenerateParamsMessage } from '../models';

export class AiHelper {
  static mergeSequentialMessagesWithSameRole(
    messages: AiGenerateParamsMessage[],
  ): AiGenerateParamsMessage[] {
    if (!messages.length) {
      return [];
    }

    const mergedMessages: AiGenerateParamsMessage[] = [];
    let mergedMessage: AiGenerateParamsMessage = { ...messages[0] };
    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i];
      if (currentMessage.role === mergedMessage.role) {
        mergedMessage.content += ` ${currentMessage.content}`;
      } else {
        mergedMessages.push(mergedMessage);
        mergedMessage = { ...currentMessage };
      }
    }
    mergedMessages.push(mergedMessage);

    return mergedMessages;
  }
}