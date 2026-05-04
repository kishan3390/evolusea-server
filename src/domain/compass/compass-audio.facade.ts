import { Injectable } from '@nestjs/common';
import { TranscribeAudioCommandHandler } from '@domain/compass/application/commands/transcribe-audio';
import {
  TranscribeAudioCommand,
  TranscribeAudioResult,
} from '@domain/compass/application/commands/transcribe-audio/transcribe-audio.command';

@Injectable()
export class CompassAudioFacade {
  constructor(
    private readonly transcribeAudioCommandHandler: TranscribeAudioCommandHandler,
  ) {}

  async transcribeAudio(
    command: TranscribeAudioCommand,
  ): Promise<TranscribeAudioResult> {
    return this.transcribeAudioCommandHandler.handle(command);
  }
}
