import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { PathRepository, Path } from '../../../domain';
import { EntityIdGenerator } from '@building-blocks/domain';
import { CreatePathCommand } from './create-path.command';
import { EventEmitter } from '../../../../../event-emitter';
import { PathCreatedEvent } from '../../events/path-created/path-created.event';

@Injectable()
export class CreatePathCommandHandler
  implements CommandHandler<CreatePathCommand, Path>
{
  constructor(
    private readonly pathRepository: PathRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async handle(command: CreatePathCommand): Promise<Path> {
    const path = Path.create({
      title: command.title,
      description: command.description,
      userProfileId: command.userProfileId,
      date: command.date,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.pathRepository.create(path);

    this.eventEmitter.emit(
      new PathCreatedEvent({
        userProfileId: command.userProfileId,
        pathId: path.getId(),
      }),
    );

    return path;
  }
}
