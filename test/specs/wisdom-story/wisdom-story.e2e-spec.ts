import { Repository } from 'typeorm';
import {
  WisdomStoryBeliefSystems,
  WisdomStoryTimeToRead,
} from '@domain/wisdom-story/domain';
import {
  WisdomStoryEntity,
  WisdomStoryTranslationEntity,
} from '@domain/wisdom-story/infrastructure/entities';
import { TestApp } from '../../test-app';
import { v4 as uuid } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BeliefSystems, Languages } from '@domain/user-profile/domain';
import { Moods } from '@domain/note/domain/enums';

describe('Wisdom Story (e2e)', () => {
  let app: TestApp;
  let wisdomStoryRepository: Repository<WisdomStoryEntity>;
  let wisdomStoryTranslationRepository: Repository<WisdomStoryTranslationEntity>;

  beforeEach((context) => {
    app = context.app;
    wisdomStoryRepository = app.getProvider(
      getRepositoryToken(WisdomStoryEntity),
    );
    wisdomStoryTranslationRepository = app.getProvider(
      getRepositoryToken(WisdomStoryTranslationEntity),
    );
  });

  describe('Get wisdom story', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and non-existing wisdom story, should return 404',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.wisdomStoryAPI.getWisdomStory(uuid());
        expect(res.status).toEqual(404);
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and existing free story id, should return localized wisdom story',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const storyId = uuid();
        const story = await wisdomStoryRepository.save({
          id: storyId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image.jpg',
          timeToRead: WisdomStoryTimeToRead.OVER_TWENTY_MINUTES,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          isFree: true,
          createdAtCMS: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [],
        });
        const enTranslation = await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: storyId,
          language: Languages.English,
          title: 'Test Story',
          content: 'This is a test story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const inTranslation = await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: storyId,
          language: Languages.Indonesian,
          title: 'Cerita Uji',
          content: 'Ini adalah cerita uji.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const res1 = await user.wisdomStoryAPI.getWisdomStory(storyId);
        expect(res1.status).toEqual(200);
        expect(res1.body).toEqual({
          id: storyId,
          title: enTranslation.title,
          content: enTranslation.content,
          timeToRead: story.timeToRead,
          imageUrl: story.imageUrl,
          isFree: true,
          reflectionPrompt: null,
          themes: [],
        });

        // user changed preferred language to Indonesian
        const profile = await user.userProfileApi.getMyProfile();
        expect(profile.status).toEqual(200);
        await user.userProfileApi.updateMyProfile({
          ...profile.body,
          language: Languages.Indonesian,
        });
        const res2 = await user.wisdomStoryAPI.getWisdomStory(storyId);
        expect(res2.status).toEqual(200);
        expect(res2.body).toEqual({
          id: storyId,
          title: inTranslation.title,
          content: inTranslation.content,
          timeToRead: story.timeToRead,
          imageUrl: story.imageUrl,
          isFree: true,
          reflectionPrompt: null,
          themes: [],
        });

        // user changed preferred language to Thai (should return English as fallback bcs no Thai translation)
        const profile2 = await user.userProfileApi.getMyProfile();
        expect(profile2.status).toEqual(200);
        await user.userProfileApi.updateMyProfile({
          ...profile2.body,
          language: Languages.Thai,
        });
        const res3 = await user.wisdomStoryAPI.getWisdomStory(storyId);
        expect(res3.status).toEqual(200);
        expect(res3.body).toEqual({
          id: storyId,
          title: enTranslation.title,
          content: enTranslation.content,
          timeToRead: story.timeToRead,
          imageUrl: story.imageUrl,
          isFree: true,
          reflectionPrompt: null,
          themes: [],
        });
      },
    );

    it(
      'given premium user tier and existing non free story id, should return localized wisdom story',
      async () => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: true,
        });
        const storyId = uuid();
        const story = await wisdomStoryRepository.save({
          id: storyId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image.jpg',
          timeToRead: WisdomStoryTimeToRead.OVER_TWENTY_MINUTES,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          isFree: false,
          createdAtCMS: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [],
        });
        const enTranslation = await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: storyId,
          language: Languages.English,
          title: 'Test Story',
          content: 'This is a test story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const inTranslation = await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: storyId,
          language: Languages.Indonesian,
          title: 'Cerita Uji',
          content: 'Ini adalah cerita uji.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const res1 = await user.wisdomStoryAPI.getWisdomStory(storyId);
        expect(res1.status).toEqual(200);
        expect(res1.body).toEqual({
          id: storyId,
          title: enTranslation.title,
          content: enTranslation.content,
          timeToRead: story.timeToRead,
          imageUrl: story.imageUrl,
          isFree: false,
          reflectionPrompt: null,
          themes: [],
        });

        // user changed preferred language to Indonesian
        const profile = await user.userProfileApi.getMyProfile();
        expect(profile.status).toEqual(200);
        await user.userProfileApi.updateMyProfile({
          ...profile.body,
          language: Languages.Indonesian,
        });
        const res2 = await user.wisdomStoryAPI.getWisdomStory(storyId);
        expect(res2.status).toEqual(200);
        expect(res2.body).toEqual({
          id: storyId,
          title: inTranslation.title,
          content: inTranslation.content,
          timeToRead: story.timeToRead,
          imageUrl: story.imageUrl,
          isFree: false,
          reflectionPrompt: null,
          themes: [],
        });

        // user changed preferred language to Thai (should return English as fallback bcs no Thai translation)
        const profile2 = await user.userProfileApi.getMyProfile();
        expect(profile2.status).toEqual(200);
        await user.userProfileApi.updateMyProfile({
          ...profile2.body,
          language: Languages.Thai,
        });
        const res3 = await user.wisdomStoryAPI.getWisdomStory(storyId);
        expect(res3.status).toEqual(200);
        expect(res3.body).toEqual({
          id: storyId,
          title: enTranslation.title,
          content: enTranslation.content,
          timeToRead: story.timeToRead,
          imageUrl: story.imageUrl,
          isFree: false,
          reflectionPrompt: null,
          themes: [],
        });
      },
    );

    it(
      'given free user tier and existing non free story id, should fail with forbidden',
      async () => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: false,
        });
        const storyId = uuid();
        await wisdomStoryRepository.save({
          id: storyId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image.jpg',
          timeToRead: WisdomStoryTimeToRead.OVER_TWENTY_MINUTES,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          isFree: false,
          createdAtCMS: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [],
        });

        const res1 = await user.wisdomStoryAPI.getWisdomStory(storyId);
        expect(res1.status).toEqual(403);
      },
    );
  });

  describe('List wisdom stories', () => {
    it.for([['premium'], ['free']])(
      'given %s user tier and no wisdom stories, should return empty array',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });
        const res = await user.wisdomStoryAPI.listWisdomStories();
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
          items: [],
          hasMore: false,
          totalPages: 1,
          totalItems: 0,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and free stories, should list localized wisdom stories',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        }); // initially English
        const story1Id = uuid();
        const story1 = await wisdomStoryRepository.save({
          id: story1Id,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image.jpg',
          timeToRead: WisdomStoryTimeToRead.OVER_TWENTY_MINUTES,
          isFree: true,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [],
        });
        const enTranslation = await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: story1Id,
          language: Languages.English,
          title: 'Test Story',
          content: 'This is a test story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const inTranslation = await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: story1Id,
          language: Languages.Indonesian,
          title: 'Cerita Uji',
          content: 'Ini adalah cerita uji.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const res1 = await user.wisdomStoryAPI.listWisdomStories();
        expect(res1.status).toEqual(200);
        expect(res1.body).toEqual({
          items: [
            {
              id: story1Id,
              title: enTranslation.title,
              timeToRead: story1.timeToRead,
              imageUrl: story1.imageUrl,
              isFree: true,
            },
          ],
          hasMore: false,
          totalPages: 1,
          totalItems: 1,
        });

        // user changed preferred language to Indonesian
        const profile = await user.userProfileApi.getMyProfile();
        expect(profile.status).toEqual(200);
        await user.userProfileApi.updateMyProfile({
          ...profile.body,
          language: Languages.Indonesian,
        });
        const res2 = await user.wisdomStoryAPI.listWisdomStories();
        expect(res2.status).toEqual(200);
        expect(res2.body).toEqual({
          items: [
            {
              id: story1Id,
              title: inTranslation.title,
              timeToRead: story1.timeToRead,
              imageUrl: story1.imageUrl,
              isFree: true,
            },
          ],
          hasMore: false,
          totalPages: 1,
          totalItems: 1,
        });

        // user changed preferred language to Thai (should return English as fallback bcs no Thai translation)
        const profile2 = await user.userProfileApi.getMyProfile();
        expect(profile2.status).toEqual(200);
        await user.userProfileApi.updateMyProfile({
          ...profile2.body,
          language: Languages.Thai,
        });
        const res3 = await user.wisdomStoryAPI.listWisdomStories();
        expect(res3.status).toEqual(200);
        expect(res3.body.items.length).toEqual(1);
        expect(res3.body).toEqual({
          items: [
            {
              id: story1Id,
              title: enTranslation.title,
              timeToRead: story1.timeToRead,
              imageUrl: story1.imageUrl,
              isFree: true,
            },
          ],
          hasMore: false,
          totalPages: 1,
          totalItems: 1,
        });
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier and free stories, should return wisdom stories sorted by createdAtCMS DESC when user has no notes',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        const oldDate = new Date('2024-01-01');
        const middleDate = new Date('2024-06-01');
        const newDate = new Date('2024-12-01');

        const story1Id = uuid();
        await wisdomStoryRepository.save({
          id: story1Id,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image1.jpg',
          timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
          isFree: true,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: oldDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: story1Id,
          language: Languages.English,
          title: 'Oldest Story',
          content: 'This is the oldest story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const story2Id = uuid();
        await wisdomStoryRepository.save({
          id: story2Id,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image2.jpg',
          timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
          isFree: true,
          mood: Moods.Motivated,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: newDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: story2Id,
          language: Languages.English,
          title: 'Newest Story',
          content: 'This is the newest story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const story3Id = uuid();
        await wisdomStoryRepository.save({
          id: story3Id,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image3.jpg',
          timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
          isFree: true,
          mood: Moods.Uncertain,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: middleDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: story3Id,
          language: Languages.English,
          title: 'Middle Story',
          content: 'This is the middle story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const res = await user.wisdomStoryAPI.listWisdomStories();
        expect(res.status).toEqual(200);
        expect(res.body.items.length).toEqual(3);

        expect(res.body.items[0].id).toEqual(story2Id);
        expect(res.body.items[0].title).toEqual('Newest Story');
        expect(res.body.items[1].id).toEqual(story3Id);
        expect(res.body.items[1].title).toEqual('Middle Story');
        expect(res.body.items[2].id).toEqual(story1Id);
        expect(res.body.items[2].title).toEqual('Oldest Story');
      },
    );

    it.for([['premium'], ['free']])(
      'given %s user tier, free stories and existing note, should return wisdom stories sorted by mood (alphabetically) then by createdAtCMS DESC when user has notes',
      async ([planType]) => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: planType === 'premium',
        });

        await user.noteAPI.createNote({
          title: 'My note',
          description: 'Note description',
          mood: Moods.Motivated,
          anonymousSharingEnabled: false,
        });

        const oldDate = new Date('2024-01-01');
        const middleDate = new Date('2024-06-01');
        const newDate = new Date('2024-12-01');

        const motivatedNewId = uuid();
        await wisdomStoryRepository.save({
          id: motivatedNewId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image1.jpg',
          timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
          isFree: true,
          mood: Moods.Motivated,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: newDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: motivatedNewId,
          language: Languages.English,
          title: 'Motivated New',
          content: 'Newest motivated story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const calmMiddleId = uuid();
        await wisdomStoryRepository.save({
          id: calmMiddleId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image2.jpg',
          timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
          isFree: true,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: middleDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: calmMiddleId,
          language: Languages.English,
          title: 'Calm Middle',
          content: 'Middle calm story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const uncertainNewId = uuid();
        await wisdomStoryRepository.save({
          id: uncertainNewId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image3.jpg',
          timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
          isFree: true,
          mood: Moods.Uncertain,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: newDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: uncertainNewId,
          language: Languages.English,
          title: 'Uncertain New',
          content: 'Newest uncertain story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const calmNewId = uuid();
        await wisdomStoryRepository.save({
          id: calmNewId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image4.jpg',
          timeToRead: WisdomStoryTimeToRead.OVER_TWENTY_MINUTES,
          isFree: true,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: newDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: calmNewId,
          language: Languages.English,
          title: 'Calm New',
          content: 'Newest calm story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const motivatedOldId = uuid();
        await wisdomStoryRepository.save({
          id: motivatedOldId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image5.jpg',
          timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
          isFree: true,
          mood: Moods.Motivated,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: oldDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: motivatedOldId,
          language: Languages.English,
          title: 'Motivated Old',
          content: 'Oldest motivated story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const overwhelmedMiddleId = uuid();
        await wisdomStoryRepository.save({
          id: overwhelmedMiddleId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/image6.jpg',
          timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
          isFree: true,
          mood: Moods.Overwhelmed,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: middleDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: overwhelmedMiddleId,
          language: Languages.English,
          title: 'Overwhelmed Middle',
          content: 'Middle overwhelmed story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const res = await user.wisdomStoryAPI.listWisdomStories();
        expect(res.status).toEqual(200);
        expect(res.body.items.length).toEqual(6);

        expect(res.body.items[0].id).toEqual(calmNewId);
        expect(res.body.items[0].title).toEqual('Calm New');
        expect(res.body.items[1].id).toEqual(calmMiddleId);
        expect(res.body.items[1].title).toEqual('Calm Middle');
        expect(res.body.items[2].id).toEqual(motivatedNewId);
        expect(res.body.items[2].title).toEqual('Motivated New');
        expect(res.body.items[3].id).toEqual(motivatedOldId);
        expect(res.body.items[3].title).toEqual('Motivated Old');
        expect(res.body.items[4].id).toEqual(overwhelmedMiddleId);
        expect(res.body.items[4].title).toEqual('Overwhelmed Middle');
        expect(res.body.items[5].id).toEqual(uncertainNewId);
        expect(res.body.items[5].title).toEqual('Uncertain New');
      },
    );

    it(
      'given free user tier with notes and both free and premium stories, should return only free wisdom stories sorted by mood (alphabetically) then by createdAtCMS DESC',
      async () => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: false,
        });

        await user.noteAPI.createNote({
          title: 'My note',
          description: 'Note description',
          mood: Moods.Calm,
          anonymousSharingEnabled: false,
        });

        const oldDate = new Date('2024-01-01');
        const middleDate = new Date('2024-06-01');
        const newDate = new Date('2024-12-01');

        const calmFreeId = uuid();
        await wisdomStoryRepository.save({
          id: calmFreeId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/free-calm.jpg',
          timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
          isFree: true,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: newDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: calmFreeId,
          language: Languages.English,
          title: 'Calm Free',
          content: 'Newest calm free story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const calmPremiumId = uuid();
        await wisdomStoryRepository.save({
          id: calmPremiumId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/premium-calm.jpg',
          timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
          isFree: false,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: middleDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: calmPremiumId,
          language: Languages.English,
          title: 'Calm Premium',
          content: 'Calm premium story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const motivatedFreeId = uuid();
        await wisdomStoryRepository.save({
          id: motivatedFreeId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/free-motivated.jpg',
          timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
          isFree: true,
          mood: Moods.Motivated,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: middleDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: motivatedFreeId,
          language: Languages.English,
          title: 'Motivated Free',
          content: 'Motivated free story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const motivatedPremiumId = uuid();
        await wisdomStoryRepository.save({
          id: motivatedPremiumId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/premium-motivated.jpg',
          timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
          isFree: false,
          mood: Moods.Motivated,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: oldDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: motivatedPremiumId,
          language: Languages.English,
          title: 'Motivated Premium',
          content: 'Motivated premium story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const overwhelmedFreeId = uuid();
        await wisdomStoryRepository.save({
          id: overwhelmedFreeId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/free-overwhelmed.jpg',
          timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
          isFree: true,
          mood: Moods.Overwhelmed,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: oldDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: overwhelmedFreeId,
          language: Languages.English,
          title: 'Overwhelmed Free',
          content: 'Overwhelmed free story.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const res =
          await user.wisdomStoryAPI.listWisdomStories();
        expect(res.status).toEqual(200);
        expect(res.body.items.length).toEqual(3);
        const freeItems = res.body.items;
        expect(freeItems.map((item) => item.id)).toEqual([
          calmFreeId,
          motivatedFreeId,
          overwhelmedFreeId,
        ]);
        freeItems.forEach((item) => expect(item.isFree).toEqual(true));
      },
    );

    it('given premium user tier with no notes and both free and premium stories, should return all wisdom stories sorted by createdAtCMS DESC', async () => {
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: true,
      });

      const veryOldDate = new Date('2024-01-01');
      const oldDate = new Date('2024-06-01');
      const middleDate = new Date('2024-12-01');
      const newDate = new Date('2025-02-01');

      const story1Id = uuid();
      await wisdomStoryRepository.save({
        id: story1Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image1.jpg',
        timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
        isFree: false,
        mood: Moods.Calm,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: veryOldDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story1Id,
        language: Languages.English,
        title: 'Very Old Story',
        content: 'This is the very old story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const story2Id = uuid();
      await wisdomStoryRepository.save({
        id: story2Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image2.jpg',
        timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
        isFree: true,
        mood: Moods.Motivated,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: middleDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story2Id,
        language: Languages.English,
        title: 'Middle Story',
        content: 'This is the middle story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const story3Id = uuid();
      await wisdomStoryRepository.save({
        id: story3Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image3.jpg',
        timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
        isFree: false,
        mood: Moods.Uncertain,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: oldDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story3Id,
        language: Languages.English,
        title: 'Old Story',
        content: 'This is the old story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const story4Id = uuid();
      await wisdomStoryRepository.save({
        id: story4Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image3.jpg',
        timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
        isFree: true,
        mood: Moods.Uncertain,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: newDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story4Id,
        language: Languages.English,
        title: 'New Story',
        content: 'This is the new story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await user.wisdomStoryAPI.listWisdomStories();
      expect(res.status).toEqual(200);
      expect(res.body.items.length).toEqual(4);

      expect(res.body.items[0].id).toEqual(story4Id);
      expect(res.body.items[0].title).toEqual('New Story');
      expect(res.body.items[1].id).toEqual(story2Id);
      expect(res.body.items[1].title).toEqual('Middle Story');
      expect(res.body.items[2].id).toEqual(story3Id);
      expect(res.body.items[2].title).toEqual('Old Story');
      expect(res.body.items[3].id).toEqual(story1Id);
      expect(res.body.items[3].title).toEqual('Very Old Story');
    });

    it('given free user tier with no notes and both free and premium stories, should return only free wisdom stories sorted by createdAtCMS DESC', async () => {
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });

      const veryOldDate = new Date('2024-01-01');
      const oldDate = new Date('2024-06-01');
      const middleDate = new Date('2024-12-01');
      const newDate = new Date('2025-02-01');

      const story1Id = uuid();
      await wisdomStoryRepository.save({
        id: story1Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image1.jpg',
        timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
        isFree: false,
        mood: Moods.Calm,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: veryOldDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story1Id,
        language: Languages.English,
        title: 'Very Old Story',
        content: 'This is the very old story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const story2Id = uuid();
      await wisdomStoryRepository.save({
        id: story2Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image2.jpg',
        timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
        isFree: true,
        mood: Moods.Motivated,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: middleDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story2Id,
        language: Languages.English,
        title: 'Middle Story',
        content: 'This is the middle story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const story3Id = uuid();
      await wisdomStoryRepository.save({
        id: story3Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image3.jpg',
        timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
        isFree: false,
        mood: Moods.Uncertain,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: oldDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story3Id,
        language: Languages.English,
        title: 'Old Story',
        content: 'This is the old story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const story4Id = uuid();
      await wisdomStoryRepository.save({
        id: story4Id,
        CMSId: uuid(),
        imageUrl: 'http://example.com/image3.jpg',
        timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
        isFree: true,
        mood: Moods.Uncertain,
        beliefSystem: BeliefSystems.ThaiBuddhism,
        createdAtCMS: newDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await wisdomStoryTranslationRepository.save({
        id: uuid(),
        wisdomStoryId: story4Id,
        language: Languages.English,
        title: 'New Story',
        content: 'This is the new story.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await user.wisdomStoryAPI.listWisdomStories();
      expect(res.status).toEqual(200);
      expect(res.body.items.length).toEqual(2);

      expect(res.body.items[0].id).toEqual(story4Id);
      expect(res.body.items[0].title).toEqual('New Story');
      expect(res.body.items[1].id).toEqual(story2Id);
      expect(res.body.items[1].title).toEqual('Middle Story');
    });

    it(
      'given premium user tier with stories from multiple belief systems, should list user belief and general stories only',
      async () => {
        const user = await app.signedInVerifiedAccount({
          premiumEntitlement: true,
        });

        const sharedNewDate = new Date('2025-03-01');
        const olderDate = new Date('2024-11-01');

        const generalStoryId = uuid();
        await wisdomStoryRepository.save({
          id: generalStoryId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/general.jpg',
          timeToRead: WisdomStoryTimeToRead.TEN_MINUTES,
          isFree: false,
          mood: Moods.Motivated,
          beliefSystem: WisdomStoryBeliefSystems.General,
          createdAtCMS: sharedNewDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: generalStoryId,
          language: Languages.English,
          title: 'General Premium Story',
          content: 'Shared for all beliefs.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const userBeliefStoryId = uuid();
        await wisdomStoryRepository.save({
          id: userBeliefStoryId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/user-belief.jpg',
          timeToRead: WisdomStoryTimeToRead.AROUND_FIVE_MINUTES,
          isFree: true,
          mood: Moods.Calm,
          beliefSystem: BeliefSystems.ThaiBuddhism,
          createdAtCMS: olderDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: userBeliefStoryId,
          language: Languages.English,
          title: 'Thai Buddhism Story',
          content: 'Specific to Thai Buddhism.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const otherBeliefStoryId = uuid();
        await wisdomStoryRepository.save({
          id: otherBeliefStoryId,
          CMSId: uuid(),
          imageUrl: 'http://example.com/christianity.jpg',
          timeToRead: WisdomStoryTimeToRead.TWENTY_MINUTES,
          isFree: true,
          mood: Moods.Uncertain,
          beliefSystem: BeliefSystems.Christianity,
          createdAtCMS: sharedNewDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await wisdomStoryTranslationRepository.save({
          id: uuid(),
          wisdomStoryId: otherBeliefStoryId,
          language: Languages.English,
          title: 'Christianity Story',
          content: 'Should not be visible for Thai belief.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const res = await user.wisdomStoryAPI.listWisdomStories();
        expect(res.status).toEqual(200);
        expect(res.body.items.map((item) => item.id)).toEqual([
          generalStoryId,
          userBeliefStoryId,
        ]);
      },
    );
  });
});
