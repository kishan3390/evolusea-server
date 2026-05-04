import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuotePoolEntity } from './quote-pool.entity';

@Entity({ name: 'user_daily_quotes' })
@Index(['userProfileId', 'date', 'orderIndex'], { unique: true })
@Index(['userProfileId', 'date'])
export class UserDailyQuoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_profile_id' })
  userProfileId: string;

  @Column({ type: 'uuid', name: 'quote_pool_id' })
  quotePoolId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'smallint', name: 'order_index' })
  orderIndex: number;

  @ManyToOne(() => QuotePoolEntity, { eager: true })
  @JoinColumn({ name: 'quote_pool_id', referencedColumnName: 'id' })
  quotePool?: QuotePoolEntity;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;
}
