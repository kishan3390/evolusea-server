import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileEntity } from '../../../user-profile/infrastructure';
import { Moods } from '../../domain/enums';

@Entity({ name: 'notes' })
export class NoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  mood: Moods | null;

  @Column({ type: 'boolean', default: false })
  anonymousSharingEnabled: boolean;

  @Index()
  @Column({ type: 'uuid' })
  userProfileId: string;

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
