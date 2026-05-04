import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'quote_pool' })
@Index(['beliefSystem', 'mood', 'language'])
export class QuotePoolEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  attribution: string;

  @Column({ type: 'varchar', nullable: true })
  source: string | null;

  @Column({ type: 'varchar' })
  mood: string;

  @Column({ type: 'varchar', name: 'belief_system' })
  beliefSystem: string;

  @Column({ type: 'varchar' })
  language: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;
}
