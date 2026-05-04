import { CommandHandler } from '@building-blocks/application';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AccountRepository } from '../../../domain';
import { DeleteAccountCommand } from './delete-account.command';

@Injectable()
export class DeleteAccountCommandHandler
  implements CommandHandler<DeleteAccountCommand, void>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async handle(command: DeleteAccountCommand): Promise<void> {
    const account = await this.accountRepository.getById(command.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.accountRepository.delete(account.getId());
  }
}
