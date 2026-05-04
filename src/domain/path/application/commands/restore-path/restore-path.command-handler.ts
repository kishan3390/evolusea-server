import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { PathRepository, Path } from '../../../domain';
import { RestorePathCommand } from './restore-path.command';

@Injectable()
export class RestorePathCommandHandler
  implements CommandHandler<RestorePathCommand, Path>
{
  constructor(private readonly pathRepository: PathRepository) {}

  async handle(command: RestorePathCommand): Promise<Path> {
    const path = await this.pathRepository.findOneBy({
      id: command.id,
      userProfileId: command.userProfileId,
    });
    if (!path) {
      throw new NotFoundException();
    }

    path.restore();

    await this.pathRepository.update(path);
    return path;
  }
}
