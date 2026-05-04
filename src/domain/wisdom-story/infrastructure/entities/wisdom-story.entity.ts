import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  WisdomStoryBeliefSystems,
  WisdomStoryTimeToRead,
} from '../../domain';
import { Moods } from '../../../note/domain/enums';

@Entity({ name: 'wisdom_stories' })
export class WisdomStoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  CMSId: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar' })
  timeToRead: WisdomStoryTimeToRead;

  @Column({ type: 'boolean', default: true })
  isFree: boolean;

  @Column({ type: 'varchar', default: WisdomStoryBeliefSystems.General })
  beliefSystem: WisdomStoryBeliefSystems;

  @Column({ type: 'timestamptz' })
  createdAtCMS: Date;

  @Column({ type: 'varchar', default: Moods.Calm, nullable: true })
  mood: Moods;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
