import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordDailyEngagementCommandHandler } from './record-daily-engagement.command-handler';
import { DailyEngagement } from '../../../domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';

describe('RecordDailyEngagementCommandHandler', () => {
  let handler: RecordDailyEngagementCommandHandler;
  let mockRepository: {
    upsert: ReturnType<typeof vi.fn>;
    findAllDatesByUserProfileId: ReturnType<typeof vi.fn>;
  };
  let mockEntityIdGenerator: { generate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRepository = {
      upsert: vi.fn().mockResolvedValue(undefined),
      findAllDatesByUserProfileId: vi.fn().mockResolvedValue([]),
    };
    mockEntityIdGenerator = {
      generate: vi.fn().mockReturnValue('generated-id-123'),
    };
    handler = new RecordDailyEngagementCommandHandler(
      mockRepository as any,
      mockEntityIdGenerator as any,
    );
  });

  describe('handle', () => {
    it('creates a DailyEngagement and upserts it', async () => {
      const command = { userProfileId: 'user-1' };

      await handler.handle(command);

      expect(mockRepository.upsert).toHaveBeenCalledTimes(1);
      const upsertedEntity = mockRepository.upsert.mock.calls[0][0];
      expect(upsertedEntity).toBeInstanceOf(DailyEngagement);
      expect(upsertedEntity.getUserProfileId()).toBe('user-1');
      expect(upsertedEntity.getId()).toBe('generated-id-123');
    });

    it('uses Bangkok current date string for the engagement date', async () => {
      const spy = vi
        .spyOn(DateHelpers, 'getBangkokCurrentDateString')
        .mockReturnValue('2026-02-10');

      await handler.handle({ userProfileId: 'user-1' });

      expect(spy).toHaveBeenCalled();
      const upsertedEntity = mockRepository.upsert.mock
        .calls[0][0] as DailyEngagement;
      expect(upsertedEntity.getDate()).toBe('2026-02-10');

      spy.mockRestore();
    });

    it('generates a unique entity id via EntityIdGenerator', async () => {
      await handler.handle({ userProfileId: 'user-1' });

      expect(mockEntityIdGenerator.generate).toHaveBeenCalledTimes(1);
    });

    it('propagates repository errors', async () => {
      mockRepository.upsert.mockRejectedValue(new Error('DB error'));

      await expect(handler.handle({ userProfileId: 'user-1' })).rejects.toThrow(
        'DB error',
      );
    });
  });
});
