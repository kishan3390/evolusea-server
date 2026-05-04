import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { EntityIdGenerator } from '@building-blocks/domain';
import { Account } from '../../../domain';
import { AccountRepository } from '../../../domain/repositories/account.repository';
import { SynchronizeAccountCommand } from './synchronize-account.command';

@Injectable()
export class SynchronizeAccountCommandHandler
  implements CommandHandler<SynchronizeAccountCommand, Account>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {}

  async handle(command: SynchronizeAccountCommand): Promise<Account> {
    const account = await this.accountRepository.getByAuthProviderId(
      command.providerAuthId,
    );
    if (account) {
      return account;
    }
    return await this.createAccount(command);
  }

  private async createAccount(
    command: SynchronizeAccountCommand,
  ): Promise<Account> {
    const newAccount = Account.create({
      authProviderId: command.providerAuthId,
      email: command.email,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.accountRepository.create(newAccount);
    return newAccount;
  }
}
