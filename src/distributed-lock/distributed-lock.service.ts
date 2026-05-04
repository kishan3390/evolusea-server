import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { DistributedLock } from './distributed-lock.entity';

type ExecuteWithLockResult<T> =
  | {
      lockAcquired: true;
      result: T;
    }
  | {
      lockAcquired: false;
    };

@Injectable()
export class DistributedLockService {
  constructor(private readonly dataSource: DataSource) {}

  async executeWithLock<T>(
    lockKey: string,
    ttl: number,
    fn: () => Promise<T>,
  ): Promise<ExecuteWithLockResult<T>> {
    const ownerToken = uuid();
    const acquired = await this.tryAcquireLock(lockKey, ttl, ownerToken);
    if (!acquired) {
      return { lockAcquired: false };
    }
    try {
      return {
        lockAcquired: true,
        result: await fn(),
      };
    } finally {
      await this.releaseLock(lockKey, ownerToken);
    }
  }

  private async tryAcquireLock(
    lockKey: string,
    ttlMs: number,
    ownerToken: string,
  ): Promise<boolean> {
    const qb = this.dataSource
      .createQueryBuilder()
      .insert()
      .into(DistributedLock)
      .values({
        name: lockKey,
        ownerToken,
        releaseLockAt: () => `NOW() + (${ttlMs} || ' milliseconds')::interval`,
      })
      .onConflict(
        `
        ("name") DO UPDATE
        SET owner_token = EXCLUDED.owner_token,
            release_lock_at = EXCLUDED.release_lock_at
        WHERE "distributed_locks".release_lock_at <= NOW()
      `,
      )
      .returning('id');

    const res = await qb.execute();
    return res.raw?.length > 0;
  }

  private async releaseLock(
    lockKey: string,
    ownerToken: string,
  ): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(DistributedLock)
      .where('name = :name AND owner_token = :ownerToken', {
        name: lockKey,
        ownerToken,
      })
      .execute();
  }
}
