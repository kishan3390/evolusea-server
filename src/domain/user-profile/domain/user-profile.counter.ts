export abstract class UserProfileCounter {
  abstract countUsersProfilesByAccountId(accountId: string): Promise<number>;
}
