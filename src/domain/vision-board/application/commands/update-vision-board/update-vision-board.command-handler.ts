import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { UpdateVisionBoardCommand } from './update-vision-board.command';
import { VisionBoard, VisionBoardRepository } from '../../../domain';

@Injectable()
export class UpdateVisionBoardCommandHandler
  implements CommandHandler<UpdateVisionBoardCommand, VisionBoard>
{
  constructor(private readonly visionBoardRepository: VisionBoardRepository) {}

  async handle(command: UpdateVisionBoardCommand): Promise<VisionBoard> {
    const visionBoard = await this.visionBoardRepository.findOneBy({
      visionBoardId: command.visionBoardId,
      userProfileId: command.userProfileId,
    });
    if (!visionBoard) {
      throw new NotFoundException('Vision board not found');
    }

    visionBoard
      .setTitle(command.title)
      .setDescription(command.description)
      .setPathIds(command.pathsIds)
      .setNoteIds(command.notesIds)
      .setWisdomStoryIds(command.wisdomStoriesIds);

    await this.visionBoardRepository.update(visionBoard);

    return visionBoard;
  }
}
