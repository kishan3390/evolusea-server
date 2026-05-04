import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileEntity } from '@domain/user-profile/infrastructure';

@Entity({ name: 'vision_boards' })
export class VisionBoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userProfileId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  pathsIds: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  notesIds: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  wisdomStoriesIds: string[];

  @ManyToOne('UserProfileEntity', () => UserProfileEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_profile_id', referencedColumnName: 'id' })
  user?: UserProfileEntity;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
