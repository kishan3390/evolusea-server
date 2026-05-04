import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  CountryCodes,
  BeliefSystems,
  Languages,
} from '@domain/user-profile/domain';
import { AccountEntity } from '@domain/account/infrastructure';

@Entity({ name: 'users_profiles' })
export class UserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @OneToOne('AccountEntity', () => AccountEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account?: AccountEntity;

  @Column({ type: 'varchar' })
  countryCode: CountryCodes;

  @Column({ type: 'varchar' })
  belief: BeliefSystems;

  @Column({ type: 'varchar', default: Languages.English })
  language: Languages;

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
