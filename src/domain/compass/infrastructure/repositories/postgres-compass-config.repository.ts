import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  CompassConfigRepository,
  FindCompassConfigByParams,
} from '../../domain';
import { CompassConfigMapper } from '../mappers/compass-config.mapper';
import { CompassConfigEntity } from '@domain/compass/infrastructure/entities/compass-config.entity';
import { CompassConfig } from '@domain/compass/domain/compass-config';

@Injectable()
export class PostgresCompassConfigRepository
  implements CompassConfigRepository
{
  private readonly mapper = new CompassConfigMapper();

  constructor(
    @InjectRepository(CompassConfigEntity)
    private readonly compassConfigRepository: Repository<CompassConfigEntity>,
  ) {}

  async create(entity: CompassConfig): Promise<void> {
    await this.compassConfigRepository.save(this.mapper.toPersistence(entity));
  }

  async findOneBy(
    params: FindCompassConfigByParams,
  ): Promise<CompassConfig | null> {
    const entity = await this.compassConfigRepository.findOne({
      where: {
        userProfileId: params.userProfileId,
      },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async update(entity: CompassConfig): Promise<void> {
    await this.compassConfigRepository.save(this.mapper.toPersistence(entity));
  }
}
