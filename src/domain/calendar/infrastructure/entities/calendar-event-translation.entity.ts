import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Languages } from '@domain/user-profile/domain';
import { CalendarEventEntity } from './calendar-event.entity';

@Entity({ name: 'calendar_events_translations' })
@Index(['calendarEventId', 'language'], { unique: true })
export class CalendarEventTranslationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'calendar_event_id', type: 'uuid' })
  calendarEventId: string;

  @Column({ type: 'varchar' })
  language: Languages;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => CalendarEventEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'calendar_event_id' })
  calendarEvent?: CalendarEventEntity;
}
