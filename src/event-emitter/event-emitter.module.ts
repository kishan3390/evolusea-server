import { Module } from '@nestjs/common';
import { EventEmitter } from './event-emitter';
import { EventEmitterModule as NestJsEventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [NestJsEventEmitterModule.forRoot()],
  providers: [EventEmitter],
  exports: [EventEmitter],
})
export class EventEmitterModule {}
