import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { CloseCompassChatCommand } from './index';
import { CompassChat } from '@domain/compass/domain/compass-chat';
import {
  CompassChatCloseReasons,
  CompassChatRepository,
  CompassChatStatus,
} from '@domain/compass/domain';
import { TransactionManager } from '@building-blocks/infrastructure';
import { EventEmitter } from '../../../../../event-emitter';
import { CompassChatClosedEvent } from '@domain/compass/application';

@Injectable()
export class CloseCompassChatCommandHandler
  implements CommandHandler<CloseCompassChatCommand, CompassChat>
{
  constructor(
    private readonly compassChatRepository: CompassChatRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async handle(command: CloseCompassChatCommand): Promise<CompassChat> {
    const compassChat = await this.compassChatRepository.findOneBy({
      userProfileId: command.userProfileId,
      compassChatId: command.compassChatId,
    });
    if (!compassChat) {
      throw new NotFoundException(`Compass chat not found`);
    }

    if (compassChat.getStatus() === CompassChatStatus.Closed) {
      throw new ConflictException('Compass chat is already closed');
    }

    compassChat.close(CompassChatCloseReasons.Manual);

    await this.transactionManager.execute(async (tx) => {
      await this.compassChatRepository.update(compassChat, tx);
      this.eventEmitter.emit(
        new CompassChatClosedEvent({
          userProfileId: command.userProfileId,
          compassChatId: compassChat.getId(),
        }),
      );
    });

    return compassChat;
  }
}
