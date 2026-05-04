import { Injectable } from '@nestjs/common';
import { NotificationPushTokenRepository } from '../../domain/notification-push-token.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationPushTokenEntity } from '../entities';
import { In, Repository } from 'typeorm';
import { NotificationPushToken } from '../../domain';
import { NotificationPushTokenMapper } from '../notification-push-token.mapper';

@Injectable()
export class PostgresNotificationPushTokenRepository
  implements NotificationPushTokenRepository
{
  private readonly mapper = new NotificationPushTokenMapper();

  constructor(
    @InjectRepository(NotificationPushTokenEntity)
    private readonly notificationPushTokenRepository: Repository<NotificationPushTokenEntity>,
  ) {}

  async create(entity: NotificationPushToken): Promise<void> {
    await this.notificationPushTokenRepository.save(
      this.mapper.toPersistence(entity),
    );
  }

  async deleteByToken(token: string): Promise<void> {
    await this.notificationPushTokenRepository.delete({ token });
  }

  async findOneByToken(token: string): Promise<NotificationPushToken | null> {
    const entity = await this.notificationPushTokenRepository.findOne({
      where: { token },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findManyByAccountId(
    accountId: string,
  ): Promise<NotificationPushToken[]> {
    const entities = await this.notificationPushTokenRepository.find({
      where: { accountId },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async deleteByTokenValues(tokenValues: string[]): Promise<void> {
    await this.notificationPushTokenRepository.delete({
      token: In(tokenValues),
    });
  }
}
