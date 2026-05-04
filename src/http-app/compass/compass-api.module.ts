import { Module } from '@nestjs/common';
import { CompassModule } from '@domain/compass/compass.module';
import { CompassConfigController } from './compass-config.controller';
import { CompassChatController } from './compass-chat.controller';
import { CompassChatPlaygroundController } from './compass-chat-playground.controller';
import { appEnv } from '@config';
import { CompassChatMessagesPlaygroundController } from './compass-chat-messages-playground.controller';
import { CompassChatMessagesController } from './compass-chat-messages.controller';
import { CompassAudioController } from './compass-audio.controller';
import { CompassChatRateLimitGuard } from './guards/compass-chat-rate-limit.guard';
import { CompassChatRepetitionGuard } from './guards/compass-chat-repetition.guard';
import { PremiumGuard } from '../guards';

const playgroundControllers =
  appEnv.isLocal() || appEnv.isDev()
    ? [CompassChatPlaygroundController, CompassChatMessagesPlaygroundController]
    : [];

@Module({
  imports: [CompassModule],
  controllers: [
    CompassConfigController,
    CompassChatController,
    CompassChatMessagesController,
    CompassAudioController,
    ...playgroundControllers,
  ],
  providers: [
    CompassChatRateLimitGuard,
    CompassChatRepetitionGuard,
    PremiumGuard,
  ],
})
export class CompassApiModule {}
