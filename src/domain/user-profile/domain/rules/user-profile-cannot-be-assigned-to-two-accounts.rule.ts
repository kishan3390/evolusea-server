import { AsyncBusinessRule } from '@building-blocks/domain';

import { UserProfileCounter } from '../user-profile.counter';

export interface UserCannotBeAssignedToTwoIdentitiesRuleArgs {
  userProfileCounter: UserProfileCounter;
  accountId: string;
}

export class UserProfileCannotBeAssignedToTwoAccountsRule
  implements AsyncBusinessRule
{
  constructor(
    private readonly args: UserCannotBeAssignedToTwoIdentitiesRuleArgs,
  ) {}

  async isBroken(): Promise<boolean> {
    const count = await this.args.userProfileCounter.countUsersProfilesByAccountId(
      this.args.accountId,
    );
    return count > 0;
  }

  getMessage(): string {
    return 'User profile already exists';
  }
}
