import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserProfileEntity } from '../../../user-profile/infrastructure';

@Entity({ name: 'daily_engagements' })
@Unique('UQ_daily_engagements_user_date', ['userProfileId', 'date'])
export class DailyEngagementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userProfileId: string;

  @ManyToOne('UserProfileEntity', () => UserProfileEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_profile_id', referencedColumnName: 'id' })
  user?: UserProfileEntity;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
