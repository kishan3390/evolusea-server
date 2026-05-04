import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileEntity } from '@domain/user-profile/infrastructure';
import {
  CompassChatCloseReasons,
  CompassChatSpeaker,
  CompassChatStatus,
  CompassIntentions,
  CompassTopics,
} from '@domain/compass/domain';

@Entity({ name: 'compass_chats' })
export class CompassChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userProfileId: string;

  @Column({ type: 'varchar' })
  intention: CompassIntentions;

  @Column({ type: 'varchar' })
  topic: CompassTopics;

  @Column({ type: 'varchar' })
  status: CompassChatStatus;

  @Column({ type: 'varchar', nullable: true })
  activeSpeaker: CompassChatSpeaker | null;

  @Column({ type: 'int', default: 0 })
  turnsCount: number;

  @Column({ type: 'varchar', nullable: true })
  closeReason?: CompassChatCloseReasons;

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
