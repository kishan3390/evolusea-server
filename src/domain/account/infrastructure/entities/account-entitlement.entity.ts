import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AccountEntity } from '@domain/account/infrastructure';
import { EntitlementsTypes } from '@domain/account/domain/enums';

@Entity({ name: 'accounts_entitlements' })
@Unique(['accountId', 'type'])
export class AccountEntitlementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'varchar' })
  type: EntitlementsTypes;

  @Column({ type: 'timestamptz' })
  purchasedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @ManyToOne('AccountEntity', () => AccountEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account?: AccountEntity;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
