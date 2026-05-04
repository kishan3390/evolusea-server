import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { NoteController } from './note.controller';

@Module({
  imports: [DomainModule],
  controllers: [NoteController],
})
export class NoteApiModule {}
