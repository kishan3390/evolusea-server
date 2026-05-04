import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { CreateVisionBoardCommand } from './create-vision-board.command';
import { VisionBoard, VisionBoardRepository } from '../../../domain';
import { EntityIdGenerator } from '@building-blocks/domain';
import { EventEmitter } from '../../../../../event-emitter';
import { VisionBoardCreatedEvent } from '../../events/vision-board-created/vision-board-created.event';

@Injectable()
export class CreateVisionBoardCommandHandler
  implements CommandHandler<CreateVisionBoardCommand, VisionBoard>
{
  constructor(
    private readonly visionBoardRepository: VisionBoardRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async handle(command: CreateVisionBoardCommand): Promise<VisionBoard> {
    const visionBoard = VisionBoard.create({
      userProfileId: command.userProfileId,
      title: command.title,
      description: command.description,
      pathsIds: command.pathsIds,
      notesIds: command.notesIds,
      wisdomStoriesIds: command.wisdomStoriesIds,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.visionBoardRepository.create(visionBoard);

    this.eventEmitter.emit(
      new VisionBoardCreatedEvent({
        userProfileId: command.userProfileId,
        visionBoardId: visionBoard.getId(),
      }),
    );

    return visionBoard;
  }
}
