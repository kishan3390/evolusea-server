import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser, RequiredAuth } from '../decorators';
import { PremiumGuard } from '../guards';
import { AuthUser } from '../authentication';
import { CompassAudioFacade } from '@domain/compass/compass-audio.facade';

const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
];

@Controller('users/me/compass/audio')
@RequiredAuth()
export class CompassAudioController {
  constructor(private readonly compassAudioFacade: CompassAudioFacade) {}

  @HttpCode(HttpStatus.OK)
  @Post('/transcribe')
  @UseGuards(PremiumGuard)
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async transcribeAudio(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    @CurrentUser() authUser: AuthUser,
    @Query('language') language?: string,
  ): Promise<{ text: string; language: string }> {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported audio format: ${file.mimetype}. Supported formats: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const result = await this.compassAudioFacade.transcribeAudio({
      audioBuffer: file.buffer,
      mimeType: file.mimetype,
      userLanguage: language || 'en',
      userId: authUser.userProfileId,
    });

    return result;
  }
}
