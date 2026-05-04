import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { DeleteVisionBoardCommand } from './delete-vision-board.command';
import { VisionBoardRepository } from '../../../domain';

@Injectable()
export class DeleteVisionBoardCommandHandler
  implements CommandHandler<DeleteVisionBoardCommand, void>
{
  constructor(private readonly visionBoardRepository: VisionBoardRepository) {}

  async handle(command: DeleteVisionBoardCommand): Promise<void> {
    const visionBoard = await this.visionBoardRepository.findOneBy({
      visionBoardId: command.visionBoardId,
      userProfileId: command.userProfileId,
    });
    if (!visionBoard) {
      throw new NotFoundException('Vision board not found');
    }

    await this.visionBoardRepository.delete(visionBoard.getId());
  }
}
