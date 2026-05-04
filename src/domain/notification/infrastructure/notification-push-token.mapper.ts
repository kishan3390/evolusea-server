import { Mapper } from '../../../building-blocks/infrastructure';
import { NotificationPushToken } from '../domain';
import { NotificationPushTokenEntity } from './entities';

export class NotificationPushTokenMapper
  implements Mapper<NotificationPushToken, NotificationPushTokenEntity>
{
  toDomain(entity: NotificationPushTokenEntity): NotificationPushToken {
    return new NotificationPushToken({
      id: entity.id,
      accountId: entity.accountId,
      token: entity.token,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: NotificationPushToken): NotificationPushTokenEntity {
    const props = domain.getProps();
    return {
      id: domain.getId(),
      accountId: props.accountId,
      token: props.token,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
