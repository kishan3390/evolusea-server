import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { UpdateCompassConfigCommand } from './index';
import { CompassConfig, CompassConfigRepository } from '../../../domain';

@Injectable()
export class UpdateCompassConfigCommandHandler
  implements CommandHandler<UpdateCompassConfigCommand, CompassConfig>
{
  constructor(
    private readonly compassConfigRepository: CompassConfigRepository,
  ) {}

  async handle(command: UpdateCompassConfigCommand): Promise<CompassConfig> {
    const compassConfig = await this.compassConfigRepository.findOneBy({
      userProfileId: command.userProfileId,
    });
    if (!compassConfig) {
      throw new NotFoundException('Compass config not found');
    }

    compassConfig.setGoal(command.goal).setPersonality(command.personality);

    await this.compassConfigRepository.update(compassConfig);
    return compassConfig;
  }
}
