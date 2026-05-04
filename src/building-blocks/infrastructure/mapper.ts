export interface Mapper<Domain, Entity> extends DomainMapper<Domain, Entity> {
  toPersistence(domain: Domain): Entity;
}

export interface DomainMapper<Domain, Entity> {
  toDomain(entity: Entity): Domain;
}
