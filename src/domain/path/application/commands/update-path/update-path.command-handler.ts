import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { Path, PathRepository } from '../../../domain';
import { UpdatePathCommand } from './update-path.command';

@Injectable()
export class UpdatePathCommandHandler
  implements CommandHandler<UpdatePathCommand, Path>
{
  constructor(private readonly pathRepository: PathRepository) {}

  async handle(command: UpdatePathCommand): Promise<Path> {
    const path = await this.pathRepository.findOneBy({
      id: command.pathId,
      userProfileId: command.userProfileId,
    });
    if (!path) {
      throw new NotFoundException('Path not found');
    }

    path
      .setTitle(command.title)
      .setDescription(command.description)
      .setDate(command.date);

    await this.pathRepository.update(path);
    return path;
  }
}
