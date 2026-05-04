import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginatedList, Pagination } from '@building-blocks/application';
import {
  FindVisionBoardByParams,
  VisionBoard,
  VisionBoardCountFilters,
  VisionBoardFilters,
  VisionBoardRepository,
} from '../../domain';
import { VisionBoardEntity } from '../entities';
import { VisionBoardMapper } from '../mappers/vision-board.mapper';
import {
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';

@Injectable()
export class PostgresVisionBoardRepository implements VisionBoardRepository {
  private readonly mapper = new VisionBoardMapper();

  constructor(
    @InjectRepository(VisionBoardEntity)
    private readonly repository: Repository<VisionBoardEntity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: VisionBoard, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(VisionBoardEntity).save(mappedEntity);
    }, tx);
  }

  async update(entity: VisionBoard, tx?: Transaction): Promise<void> {
    const mappedEntity = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(VisionBoardEntity).save(mappedEntity);
    }, tx);
  }

  async delete(visionBoardId: string): Promise<void> {
    await this.repository.delete(visionBoardId);
  }

  async findOneBy(
    params: FindVisionBoardByParams,
  ): Promise<VisionBoard | null> {
    const visionBoard = await this.repository.findOne({
      where: {
        id: params.visionBoardId,
        userProfileId: params.userProfileId,
      },
    });

    return visionBoard ? this.mapper.toDomain(visionBoard) : null;
  }

  async list(
    filters: VisionBoardFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<VisionBoard>> {
    const [entities, total] = await this.repository.findAndCount({
      where: {
        userProfileId: filters.userProfileId,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: pagination.getOffset(),
      take: pagination.getPerPage(),
    });

    const items = entities.map((entity) => this.mapper.toDomain(entity));
    return pagination.getPaginatedList(items, total);
  }

  count(filters: VisionBoardCountFilters): Promise<number> {
    return this.repository.count({
      where: {
        userProfileId: filters.userProfileId,
      },
    });
  }
}
