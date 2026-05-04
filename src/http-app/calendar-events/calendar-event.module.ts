import { Module } from '@nestjs/common';
import { DomainModule } from '@domain/domain.module';
import { CalendarEventController } from './calendar-event.controller';

@Module({
  imports: [DomainModule],
  controllers: [CalendarEventController],
})
export class CalendarEventApiModule {}
