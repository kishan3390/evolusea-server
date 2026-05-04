import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AiRoleEnum } from '../../../../ai';
import {
  CompassChatSpeaker,
  CompassChatMessageVisibility,
} from '@domain/compass/domain';
import { CompassChatEntity } from './compass-chat.entity';

@Entity({ name: 'compass_chats_messages' })
@Index(['compassChatId', 'visibility'] satisfies (keyof CompassChatMessageEntity)[])
export class CompassChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  compassChatId: string;

  @Column({ type: 'varchar' })
  role: AiRoleEnum;

  @Column({ type: 'varchar' })
  speaker: CompassChatSpeaker;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  visibility: CompassChatMessageVisibility;

  @Column({ type: 'int' })
  turnIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ManyToOne('CompassChatEntity', () => CompassChatEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'compass_chat_id', referencedColumnName: 'id' })
  compassChat?: CompassChatEntity;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
