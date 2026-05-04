import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileEntity } from '@domain/user-profile/infrastructure';
import { CompassPersonalities, Goals } from '@domain/compass/domain';

@Entity({ name: 'compass_configs' })
export class CompassConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  goal: Goals;

  @Column({ type: 'varchar' })
  personality: CompassPersonalities;
  
  @Column({ type: 'uuid', unique: true })
  userProfileId: string;

  @OneToOne('UserProfileEntity', () => UserProfileEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_profile_id', referencedColumnName: 'id' })
  user?: UserProfileEntity;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
