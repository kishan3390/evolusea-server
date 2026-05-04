import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompassChatEntity } from '@domain/compass/infrastructure/entities/compass-chat.entity';

@Entity({ name: 'compass_chats_summaries' })
export class CompassChatSummaryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', unique: true })
  compassChatId: string;

  @Column({ type: 'text' })
  content: string;

  @OneToOne('CompassChatEntity', () => CompassChatEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'compass_chat_id', referencedColumnName: 'id' })
  compassChat?: CompassChatEntity;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
