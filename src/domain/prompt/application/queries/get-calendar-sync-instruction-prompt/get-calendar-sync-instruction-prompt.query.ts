import { PromptQuery } from '../../prompt.query';
import { BeliefSystems } from '@domain/user-profile/domain';

export interface GetCalendarSyncInstructionPromptQueryData {
  beliefSystem: BeliefSystems;
  syncStartDate: Date;
  syncEndDate: Date;
}

export type GetCalendarSyncInstructionPromptQuery =
  PromptQuery<GetCalendarSyncInstructionPromptQueryData>;
