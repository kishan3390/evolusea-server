import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { CreateMoodCheckinCommand } from './create-mood-checkin.command';
import { MoodCheckin, MoodCheckinRepository } from '../../../domain';
import { EntityIdGenerator } from '@building-blocks/domain';
import { EventEmitter } from '../../../../../event-emitter';
import { MoodCheckinCreatedEvent } from '../../events/mood-checkin-created/mood-checkin-created.event';

@Injectable()
export class CreateMoodCheckinCommandHandler
  implements CommandHandler<CreateMoodCheckinCommand, MoodCheckin>
{
  constructor(
    private readonly moodCheckinRepository: MoodCheckinRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async handle(command: CreateMoodCheckinCommand): Promise<MoodCheckin> {
    const moodCheckin = MoodCheckin.create({
      mood: command.mood,
      userProfileId: command.userProfileId,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.moodCheckinRepository.create(moodCheckin);

    this.eventEmitter.emit(
      new MoodCheckinCreatedEvent({
        userProfileId: command.userProfileId,
        moodCheckinId: moodCheckin.getId(),
      }),
    );

    return moodCheckin;
  }
}
