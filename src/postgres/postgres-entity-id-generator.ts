import { EntityIdGenerator } from '@building-blocks/domain';
import { v4 } from 'uuid';

export class PostgresEntityIdGenerator implements EntityIdGenerator {
  generate(): string {
    return v4();
  }
}
