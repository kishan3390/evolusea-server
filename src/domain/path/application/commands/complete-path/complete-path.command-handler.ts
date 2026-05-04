import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { PathRepository, Path } from '../../../domain';
import { CompletePathCommand } from './complete-path.command';

@Injectable()
export class CompletePathCommandHandler
  implements CommandHandler<CompletePathCommand, Path>
{
  constructor(private readonly pathRepository: PathRepository) {}

  async handle(command: CompletePathCommand): Promise<Path> {
    const path = await this.pathRepository.findOneBy({
      id: command.id,
      userProfileId: command.userProfileId,
    });
    if (!path) {
      throw new NotFoundException();
    }

    path.markAsCompleted();

    await this.pathRepository.update(path);
    return path;
  }
}
