import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import {
  CompassChatCloseReasons,
  CompassChatSpeaker,
  CompassChatStatus,
  CompassIntentions,
  CompassPersonalities,
  CompassTopics,
  Goals,
} from '@domain/compass/domain';
import { expect } from 'vitest';
import { v4 as uuid } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompassChatSummaryEntity } from '@domain/compass/infrastructure/entities/compass-chat-summary.entity';
import { Repository } from 'typeorm';

describe('Close compass chat (e2e)', () => {
  let app: TestApp;
  let compassChatSummaryRepository: Repository<CompassChatSummaryEntity>;

  beforeEach((context) => {
    app = context.app;
    compassChatSummaryRepository = app.getProvider(
      getRepositoryToken(CompassChatSummaryEntity),
    );
  });

  it('given compass chat close when compass chat does not exist, closing should fail', async () => {
    const user = await app.signedInVerifiedAccount();
    const startChatRes = await user.compassChatAPI.closeCompassChat({
      compassChatId: uuid(),
    });
    expect(startChatRes.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given compass chat close when compass chat exist and is active, closing should succeed and generate summary', async () => {
    const user = await app.signedInVerifiedAccount();
    const userProfile = await user.userProfileApi.getMyProfile();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    const startChatRes = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });

    const closeChatRes = await user.compassChatAPI.closeCompassChat({
      compassChatId: startChatRes.body.id,
    });
    expect(closeChatRes.status).toEqual(HttpStatus.OK);
    expect(closeChatRes.body).toEqual({
      ...startChatRes.body,
      activeSpeaker: null,
      status: CompassChatStatus.Closed,
      updatedAt: expect.any(String),
      closeReason: CompassChatCloseReasons.Manual,
      messages: [
        {
          id: expect.any(String),
          compassChatId: startChatRes.body.id,
          content: expect.any(String),
          speaker: CompassChatSpeaker.System,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          turnIndex: 1,
          metadata: null,
        },
      ],
    });

    const { body: postCloseChatData } =
      await user.compassChatAPI.getCompassChat(startChatRes.body.id, {
        includeMessages: true,
      });
    expect(postCloseChatData).toEqual({
      ...closeChatRes.body,
      updatedAt: expect.any(String),
    });

    await app.eventEmitter.waitForAll();

    const compassChatsSummaries = await compassChatSummaryRepository.find({
      where: {
        compassChat: {
          userProfileId: userProfile.body.id,
        },
      },
    });
    expect(compassChatsSummaries?.length).toEqual(1);
    expect(compassChatsSummaries).toEqual([
      {
        id: expect.any(String),
        compassChatId: closeChatRes.body.id,
        content: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ]);
  });

  it('given compass chat close when compass chat exist and is closed, closing should fail', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    const startChatRes = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });
    await app.eventEmitter.waitForAll();

    await user.compassChatAPI.closeCompassChat({
      compassChatId: startChatRes.body.id,
    });
    await app.eventEmitter.waitForAll();

    const closeChatRes2 = await user.compassChatAPI.closeCompassChat({
      compassChatId: startChatRes.body.id,
    });
    expect(closeChatRes2.status).toEqual(HttpStatus.CONFLICT);

    await app.eventEmitter.waitForAll();
  });

  it('given long compass chat close when compass chat exist and is active, closing should succeed and return proper turns count', async () => {
    const user = await app.signedInVerifiedAccount();
    await user.compassConfigAPI.createCompassConfig({
      goal: Goals.Growth,
      personality: CompassPersonalities.Care,
    });
    const startChatRes = await user.compassChatAPI.startCompassChat({
      intention: CompassIntentions.Awareness,
      details: {
        topic: CompassTopics.OpenQuestion,
      },
    });

    await user.compassChatMessageAPI.sendCompassChatMessage(
      startChatRes.body.id,
      {
        content: 'Test message',
      },
    );

    await user.compassChatMessageAPI.sendCompassChatMessage(
      startChatRes.body.id,
      {
        content: 'Test message',
      },
    );

    await user.compassChatMessageAPI.sendCompassChatMessage(
      startChatRes.body.id,
      {
        content: 'Test message',
      },
    );

    const closeChatRes = await user.compassChatAPI.closeCompassChat({
      compassChatId: startChatRes.body.id,
    });
    expect(closeChatRes.status).toEqual(HttpStatus.OK);
    expect(closeChatRes.body).toEqual({
      ...startChatRes.body,
      activeSpeaker: null,
      turnsCount: 4,
      status: CompassChatStatus.Closed,
      updatedAt: expect.any(String),
      closeReason: CompassChatCloseReasons.Manual,
      messages: [
        {
          compassChatId: startChatRes.body.id,
          content: 'Test response',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.System,
          updatedAt: expect.any(String),
          turnIndex: 1,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test message',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.User,
          updatedAt: expect.any(String),
          turnIndex: 1,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test response',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.System,
          updatedAt: expect.any(String),
          turnIndex: 2,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test message',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.User,
          updatedAt: expect.any(String),
          turnIndex: 2,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test response',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.System,
          updatedAt: expect.any(String),
          turnIndex: 3,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test message',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.User,
          updatedAt: expect.any(String),
          turnIndex: 3,
          metadata: null,
        },
        {
          compassChatId: startChatRes.body.id,
          content: 'Test response',
          createdAt: expect.any(String),
          id: expect.any(String),
          speaker: CompassChatSpeaker.System,
          updatedAt: expect.any(String),
          turnIndex: 4,
          metadata: null,
        },
      ],
    });
    await app.eventEmitter.waitForAll();

    const { body: postEventChatsData } =
      await user.compassChatAPI.listCompassChats();
    expect(postEventChatsData.totalItems).toEqual(1);
  });
});
