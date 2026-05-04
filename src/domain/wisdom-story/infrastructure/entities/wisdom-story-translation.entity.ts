import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Languages } from '../../../user-profile/domain';
import { WisdomStoryEntity } from './wisdom-story.entity';

@Entity({ name: 'wisdom_story_translations' })
export class WisdomStoryTranslationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  wisdomStoryId: string;

  @ManyToOne('WisdomStoryEntity', () => WisdomStoryEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wisdom_story_id', referencedColumnName: 'id' })
  wisdomStory?: WisdomStoryEntity;

  @Column({ type: 'varchar' })
  language: Languages;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
