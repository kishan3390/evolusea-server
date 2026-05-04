import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('distributed_locks')
export class DistributedLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ name: 'owner_token', type: 'varchar', length: 64 })
  ownerToken: string;

  @Column({ name: 'release_lock_at', type: 'timestamptz', nullable: true })
  releaseLockAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
