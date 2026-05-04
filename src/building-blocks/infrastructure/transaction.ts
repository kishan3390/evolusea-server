import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export interface Transaction {
  getRepository<Obj extends ObjectLiteral>(
    entity: EntityTarget<Obj>,
  ): Repository<Obj>
}
