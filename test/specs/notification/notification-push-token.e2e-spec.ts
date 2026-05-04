import { Repository } from 'typeorm';
import { TestApp } from '../../test-app';
import { NotificationPushTokenEntity } from '../../../src/domain/notification/infrastructure/entities';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Register/unregister notification push token (e2e)', () => {
  let app: TestApp;
  let tokenRepository: Repository<NotificationPushTokenEntity>;

  beforeEach((context) => {
    app = context.app;
    tokenRepository = app.getProvider(
      getRepositoryToken(NotificationPushTokenEntity),
    );
  });

  describe('Register push token', () => {
    it('given unique token, should register push token successfully', async () => {
      const user = await app.signedInVerifiedAccount();

      const registerResponse = await user.notificationAPI.registerPushToken({
        token: 'sample-push-token-123',
      });

      expect(registerResponse.status).toBe(204);

      const storedToken = await tokenRepository.findOneBy({
        token: 'sample-push-token-123',
      });
      expect(storedToken?.accountId).toBe(user.id);
    });

    it('given the same token registered for same user, should return no error', async () => {
      const user = await app.signedInVerifiedAccount();

      const registerResponse1 = await user.notificationAPI.registerPushToken({
        token: 'sample-push-token-123',
      });
      expect(registerResponse1.status).toBe(204);
      const registerResponse2 = await user.notificationAPI.registerPushToken({
        token: 'sample-push-token-123',
      });
      expect(registerResponse2.status).toBe(204);
    });

    it('given the same token registered for different user, should override that token', async () => {
      const user1 = await app.signedInVerifiedAccount();
      const user2 = await app.signedInVerifiedAccount();

      const registerResponse1 = await user1.notificationAPI.registerPushToken({
        token: 'sample-push-token-123',
      });
      expect(registerResponse1.status).toBe(204);
      const registerResponse2 = await user2.notificationAPI.registerPushToken({
        token: 'sample-push-token-123',
      });
      expect(registerResponse2.status).toBe(204);

      const storedToken = await tokenRepository.findOneBy({
        token: 'sample-push-token-123',
      });
      expect(storedToken?.accountId).toBe(user2.id);
    });
  });

  describe('Unregister push token', () => {
    it('given existing token registered for the user, should unregister successfully', async () => {
      const user = await app.signedInVerifiedAccount();

      const registerResponse = await user.notificationAPI.registerPushToken({
        token: 'sample-push-token-123',
      });
      expect(registerResponse.status).toBe(204);

      const unregisterResponse = await user.notificationAPI.unregisterPushToken(
        {
          token: 'sample-push-token-123',
        },
      );
      expect(unregisterResponse.status).toBe(204);

      const unregisteredPushToken = await tokenRepository.findOneBy({
        token: 'sample-push-token-123',
      });
      expect(unregisteredPushToken).toBeNull();
    });

    it('given non-existing token, should return no error', async () => {
      const user = await app.signedInVerifiedAccount();

      const unregisterResponse = await user.notificationAPI.unregisterPushToken(
        {
          token: 'non-existing-token-456',
        },
      );
      expect(unregisterResponse.status).toBe(204);
    });
  });
});
