import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BeliefSystems } from '@domain/user-profile/domain';

@Entity({ name: 'calendar_events' })
@Index(['date', 'belief'], {
  unique: true,
})
export class CalendarEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar' })
  belief: BeliefSystems;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
