# Domain Module — Full Code Templates

Copy-paste templates for every file in a new domain module. Replace `<Module>` (PascalCase), `<module>` (camelCase), `<module-name>` (kebab-case).

## Domain Entity

`src/domain/<module-name>/domain/<module-name>.ts`

```typescript
import {
  Entity,
  EntityIdGenerator,
  EntityProps,
} from '../../../building-blocks/domain';

export interface <Module>Props extends EntityProps {
  id: string;
  userProfileId: string;
  // add fields here
}

export interface <Module>CreateArgs {
  userProfileId: string;
  // add creation params here (no id, no dates)
  entityIdGenerator: EntityIdGenerator;
}

export class <Module> extends Entity<<Module>Props> {
  private readonly id: string;
  private userProfileId: string;

  constructor(props: <Module>Props) {
    super();
    this.id = props.id;
    this.userProfileId = props.userProfileId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(args: <Module>CreateArgs): <Module> {
    const now = new Date();
    return new <Module>({
      id: args.entityIdGenerator.generate(),
      userProfileId: args.userProfileId,
      createdAt: now,
      updatedAt: now,
    });
  }

  getId(): string { return this.id; }
  getUserProfileId(): string { return this.userProfileId; }

  getProps(): <Module>Props {
    return {
      id: this.id,
      userProfileId: this.userProfileId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
```

## Abstract Repository

`src/domain/<module-name>/domain/repositories/<module-name>.repository.ts`

```typescript
import { Transaction } from '@building-blocks/infrastructure';
import { <Module> } from '../<module-name>';

export abstract class <Module>Repository {
  abstract create(entity: <Module>, tx?: Transaction): Promise<void>;
  abstract findOneBy(params: { id: string; userProfileId: string }): Promise<<Module> | null>;
  abstract update(entity: <Module>, tx?: Transaction): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
```

## TypeORM Entity

`src/domain/<module-name>/infrastructure/entities/<module-name>.entity.ts`

```typescript
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileEntity } from '../../../user-profile/infrastructure';

@Entity({ name: '<table_name_snake_case_plural>' })
export class <Module>Entity {
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

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
```

## Mapper

`src/domain/<module-name>/infrastructure/mappers/<module-name>.mapper.ts`

```typescript
import { Mapper } from '@building-blocks/infrastructure';
import { <Module> } from '../../domain';
import { <Module>Entity } from '../entities';

export class <Module>Mapper implements Mapper<<Module>, <Module>Entity> {
  toDomain(entity: <Module>Entity): <Module> {
    return new <Module>({
      id: entity.id,
      userProfileId: entity.userProfileId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: <Module>): <Module>Entity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      userProfileId: props.userProfileId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
```

## Repository Implementation

`src/domain/<module-name>/infrastructure/repositories/postgres-<module-name>.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <Module>Repository } from '../../domain/repositories';
import { <Module> } from '../../domain';
import { <Module>Entity } from '../entities';
import { <Module>Mapper } from '../mappers/<module-name>.mapper';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';

@Injectable()
export class Postgres<Module>Repository implements <Module>Repository {
  private readonly mapper = new <Module>Mapper();

  constructor(
    @InjectRepository(<Module>Entity)
    private readonly repository: Repository<<Module>Entity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: <Module>, tx?: Transaction): Promise<void> {
    const mapped = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(<Module>Entity).save(mapped);
    }, tx);
  }

  async findOneBy(params: { id: string; userProfileId: string }): Promise<<Module> | null> {
    const found = await this.repository.findOne({ where: params });
    return found ? this.mapper.toDomain(found) : null;
  }

  async update(entity: <Module>, tx?: Transaction): Promise<void> {
    const mapped = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(<Module>Entity).save(mapped);
    }, tx);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
```

## Create Command + Handler

`application/commands/create-<module-name>/create-<module-name>.command.ts`

```typescript
export interface Create<Module>Command {
  userProfileId: string;
  // fields needed to create the entity (no id, no dates)
}
```

`application/commands/create-<module-name>/create-<module-name>.command-handler.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { EntityIdGenerator } from '@building-blocks/domain';
import { TransactionManager } from '@building-blocks/infrastructure';
import { Create<Module>Command } from './create-<module-name>.command';
import { <Module>, <Module>Repository } from '../../../domain';

@Injectable()
export class Create<Module>CommandHandler
  implements CommandHandler<Create<Module>Command, <Module>>
{
  constructor(
    private readonly repository: <Module>Repository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(command: Create<Module>Command): Promise<<Module>> {
    const entity = <Module>.create({
      ...command,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.transactionManager.execute(async (tx) => {
      await this.repository.create(entity, tx);
    });

    return entity;
  }
}
```

## Get Query + Handler

`application/queries/get-<module-name>/get-<module-name>.query.ts`

```typescript
export interface Get<Module>Query {
  id: string;
  userProfileId: string;
}
```

`application/queries/get-<module-name>/get-<module-name>.query-handler.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { <Module>, <Module>Repository } from '../../../domain';
import { Get<Module>Query } from './get-<module-name>.query';

@Injectable()
export class Get<Module>QueryHandler
  implements QueryHandler<Get<Module>Query, <Module>>
{
  constructor(private readonly repository: <Module>Repository) {}

  async handle(query: Get<Module>Query): Promise<<Module> | null> {
    return this.repository.findOneBy({
      id: query.id,
      userProfileId: query.userProfileId,
    });
  }
}
```

## Facade

`src/domain/<module-name>/<module-name>.facade.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { <Module> } from './domain';
import {
  Create<Module>CommandHandler,
  Create<Module>Command,
  Get<Module>QueryHandler,
  Get<Module>Query,
} from './application';

@Injectable()
export class <Module>Facade {
  constructor(
    private readonly create<Module>Handler: Create<Module>CommandHandler,
    private readonly get<Module>Handler: Get<Module>QueryHandler,
  ) {}

  async create(command: Create<Module>Command): Promise<<Module>> {
    return this.create<Module>Handler.handle(command);
  }

  async getById(query: Get<Module>Query): Promise<<Module> | null> {
    return this.get<Module>Handler.handle(query);
  }
}
```

## NestJS Module

`src/domain/<module-name>/<module-name>.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <Module>Entity } from './infrastructure/entities';
import { <Module>Repository } from './domain';
import { Postgres<Module>Repository } from './infrastructure/repositories/postgres-<module-name>.repository';
import { <Module>Facade } from './<module-name>.facade';
import {
  Create<Module>CommandHandler,
  Get<Module>QueryHandler,
} from './application';

@Module({
  imports: [TypeOrmModule.forFeature([<Module>Entity])],
  providers: [
    { provide: <Module>Repository, useClass: Postgres<Module>Repository },
    Create<Module>CommandHandler,
    Get<Module>QueryHandler,
    <Module>Facade,
  ],
  exports: [<Module>Facade],
})
export class <Module>Module {}
```

## API Module

`src/http-app/<module-name>/<module-name>-api.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { <Module>Controller } from './<module-name>.controller';

@Module({
  imports: [DomainModule],
  controllers: [<Module>Controller],
})
export class <Module>ApiModule {}
```

## Controller

`src/http-app/<module-name>/<module-name>.controller.ts`

```typescript
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import { <Module>Facade } from '@domain/<module-name>/<module-name>.facade';
import { Create<Module>PayloadDto, <Module>Dto } from './dto';

@Controller('users/me/<module-name>s')
@RequiredAuth()
export class <Module>Controller {
  constructor(private readonly facade: <Module>Facade) {}

  @Post()
  async create(
    @Body() payload: Create<Module>PayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<<Module>Dto> {
    const entity = await this.facade.create({
      ...payload,
      userProfileId: authUser.userProfileId,
    });
    return <Module>Dto.fromEntity(entity);
  }

  @Get('/:id')
  async getById(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<<Module>Dto> {
    const entity = await this.facade.getById({
      id,
      userProfileId: authUser.userProfileId,
    });
    if (!entity) throw new NotFoundException();
    return <Module>Dto.fromEntity(entity);
  }
}
```

## Request DTO

`src/http-app/<module-name>/dto/create-<module-name>-payload.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class Create<Module>PayloadDto {
  @IsString()
  @IsNotEmpty()
  someField: string;
}
```

## Response DTO

`src/http-app/<module-name>/dto/<module-name>.dto.ts`

```typescript
import { <Module> } from '@domain/<module-name>/domain';

export class <Module>Dto {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: <Module>): <Module>Dto {
    return {
      id: entity.getId(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
```

## Domain Event (Optional)

`application/events/<module-name>-created/<module-name>-created.event.ts`

```typescript
import { EventBase } from '../../../../event-emitter';

export interface <Module>CreatedEventPayload {
  userProfileId: string;
  <module>Id: string;
}

export class <Module>CreatedEvent extends EventBase<<Module>CreatedEventPayload> {}
```

`application/events/<module-name>-created/<module-name>-created.event-handler.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { EventEmitter } from '../../../../event-emitter';
import { EventHandler } from '../../../../event-emitter/event-handler';
import {
  <Module>CreatedEvent,
  <Module>CreatedEventPayload,
} from './<module-name>-created.event';

@Injectable()
export class <Module>CreatedEventHandler extends EventHandler<<Module>CreatedEvent> {
  event = <Module>CreatedEvent;

  constructor(eventEmitter: EventEmitter) {
    super(eventEmitter);
  }

  async handle(payload: <Module>CreatedEventPayload): Promise<void> {
    // side effect logic here
  }
}
```

Emit from command handler inside transaction:

```typescript
this.eventEmitter.emit(
  new <Module>CreatedEvent({
    userProfileId: command.userProfileId,
    <module>Id: entity.getId(),
  }),
);
```
