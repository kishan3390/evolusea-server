import { ConflictException, Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { CreateCompassConfigCommand } from './index';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CompassConfigRepository } from '@domain/compass/domain/repositories/compass-config.repository';
import { CompassConfig } from '@domain/compass/domain/compass-config';

@Injectable()
export class CreateCompassConfigCommandHandler
  implements CommandHandler<CreateCompassConfigCommand, CompassConfig>
{
  constructor(
    private readonly compassConfigRepository: CompassConfigRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
  ) {}

  async handle(command: CreateCompassConfigCommand): Promise<CompassConfig> {
    const existingConfig = await this.compassConfigRepository.findOneBy({
      userProfileId: command.userProfileId,
    });
    if (existingConfig) {
      throw new ConflictException('Compass config already exists');
    }

    const compassConfig = CompassConfig.create({
      userProfileId: command.userProfileId,
      goal: command.goal,
      personality: command.personality,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.compassConfigRepository.create(compassConfig);
    return compassConfig;
  }
}
