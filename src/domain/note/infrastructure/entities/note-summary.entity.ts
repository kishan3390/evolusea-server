import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoteEntity } from '@domain/note/infrastructure/entities/note.entity';

@Entity({ name: 'notes_summaries' })
export class NoteSummaryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', unique: true })
  noteId: string;

  @Column({ type: 'text' })
  content: string;

  @OneToOne('NoteEntity', () => NoteEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'note_id', referencedColumnName: 'id' })
  note?: NoteEntity;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
