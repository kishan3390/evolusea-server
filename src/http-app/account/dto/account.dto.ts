import { Account } from '../../../domain/account/domain';

export class AccountDto {
  id: string;
  email: string;

  static fromEntity(account: Account): AccountDto {
    return {
      id: account.getId(),
      email: account.getEmail(),
    };
  }
}
