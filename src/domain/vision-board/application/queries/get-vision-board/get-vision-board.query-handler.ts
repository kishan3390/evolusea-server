import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetVisionBoardQuery } from './get-vision-board.query';
import { VisionBoard, VisionBoardRepository } from '../../../domain';

@Injectable()
export class GetVisionBoardQueryHandler
  implements QueryHandler<GetVisionBoardQuery, VisionBoard>
{
  constructor(private readonly visionBoardRepository: VisionBoardRepository) {}

  async handle(query: GetVisionBoardQuery): Promise<VisionBoard | null> {
    return this.visionBoardRepository.findOneBy({
      visionBoardId: query.visionBoardId,
      userProfileId: query.userProfileId,
    });
  }
}
