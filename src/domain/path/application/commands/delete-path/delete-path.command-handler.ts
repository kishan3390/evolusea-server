import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { PathRepository } from '../../../domain';
import { DeletePathCommand } from './delete-path.command';

@Injectable()
export class DeletePathCommandHandler
  implements CommandHandler<DeletePathCommand, void>
{
  constructor(private readonly pathRepository: PathRepository) {}

  async handle(command: DeletePathCommand): Promise<void> {
    const path = await this.pathRepository.findOneBy({
      id: command.pathId,
      userProfileId: command.userProfileId,
    });
    if (!path) {
      throw new NotFoundException('Path not found');
    }

    await this.pathRepository.delete(command.pathId);
  }
}
