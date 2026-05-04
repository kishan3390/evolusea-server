import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { Repository } from 'typeorm';
import { AccountEntity } from '@domain/account/infrastructure';
import { UserProfileEntity } from '@domain/user-profile/infrastructure';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoteEntity } from '@domain/note/infrastructure/entities/note.entity';
import { PathEntity } from '@domain/path/infrastructure/entities/path.entity';
import { VisionBoardEntity } from '@domain/vision-board/infrastructure/entities/vision-board.entity';
import { NotificationPushTokenEntity } from '@domain/notification/infrastructure/entities/notification-push-token.entity';
import { AccountEntitlementEntity } from '@domain/account/infrastructure/entities/account-entitlement.entity';
import { Moods } from '@domain/note/domain/enums';
import { v4 as uuid } from 'uuid';

describe('Delete account (e2e)', () => {
  let app: TestApp;
  let accountRepository: Repository<AccountEntity>;
  let userProfileRepository: Repository<UserProfileEntity>;
  let noteRepository: Repository<NoteEntity>;
  let pathRepository: Repository<PathEntity>;
  let visionBoardRepository: Repository<VisionBoardEntity>;
  let notificationPushTokenRepository: Repository<NotificationPushTokenEntity>;
  let accountEntitlementRepository: Repository<AccountEntitlementEntity>;

  beforeEach((context) => {
    app = context.app;
    accountRepository = app.getProvider(getRepositoryToken(AccountEntity));
    userProfileRepository = app.getProvider(
      getRepositoryToken(UserProfileEntity),
    );
    noteRepository = app.getProvider(getRepositoryToken(NoteEntity));
    pathRepository = app.getProvider(getRepositoryToken(PathEntity));
    visionBoardRepository = app.getProvider(
      getRepositoryToken(VisionBoardEntity),
    );
    notificationPushTokenRepository = app.getProvider(
      getRepositoryToken(NotificationPushTokenEntity),
    );
    accountEntitlementRepository = app.getProvider(
      getRepositoryToken(AccountEntitlementEntity),
    );
  });

  it('given existing account with related entities, deleting it should remove account and all related entities', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: true,
    });

    const noteRes = await user.noteAPI.createNote({
      title: 'test note',
      description: 'note description',
      mood: Moods.Calm,
      anonymousSharingEnabled: false,
    });
    expect(noteRes.status).toEqual(HttpStatus.CREATED);
    const createdNoteId = noteRes.body.id;

    const pathDate = new Date().toISOString().split('T')[0];
    const pathRes = await user.pathAPI.createPath({
      title: 'test path',
      description: 'path description',
      date: pathDate,
    });
    expect(pathRes.status).toEqual(HttpStatus.CREATED);
    const createdPathId = pathRes.body.id;

    const visionBoardRes = await user.visionBoardAPI.createVisionBoard({
      title: 'test board',
      description: 'board description',
      pathsIds: [createdPathId],
      notesIds: [createdNoteId],
      wisdomStoriesIds: [],
    });
    expect(visionBoardRes.status).toEqual(HttpStatus.CREATED);
    const createdVisionBoardId = visionBoardRes.body.id;

    const pushToken = `token-${uuid()}`;
    const registerPushTokenRes = await user.notificationAPI.registerPushToken({
      token: pushToken,
    });
    expect(registerPushTokenRes.status).toEqual(HttpStatus.NO_CONTENT);

    let accountInDb = await accountRepository.findOne({
      where: { id: user.id },
    });
    expect(accountInDb).toBeTruthy();

    let profileInDb = await userProfileRepository.findOne({
      where: { accountId: user.id },
    });
  expect(profileInDb).toBeTruthy();

    let noteInDb = await noteRepository.findOne({
      where: { id: createdNoteId },
    });
    expect(noteInDb).toBeTruthy();

    let pathInDb = await pathRepository.findOne({
      where: { id: createdPathId },
    });
    expect(pathInDb).toBeTruthy();

    let visionBoardInDb = await visionBoardRepository.findOne({
      where: { id: createdVisionBoardId },
    });
    expect(visionBoardInDb).toBeTruthy();

    let pushTokenInDb = await notificationPushTokenRepository.findOne({
      where: { token: pushToken },
    });
    expect(pushTokenInDb).toBeTruthy();

    let entitlementInDb = await accountEntitlementRepository.findOne({
      where: { accountId: user.id },
    });
    expect(entitlementInDb).toBeTruthy();

    const deleteRes = await user.accountAPI.deleteMyAccount();
    expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);
    expect(deleteRes.body).toEqual({});

    accountInDb = await accountRepository.findOne({
      where: { id: user.id },
    });
    expect(accountInDb).toBeNull();

    profileInDb = await userProfileRepository.findOne({
      where: { accountId: user.id },
    });
    expect(profileInDb).toBeNull();

    noteInDb = await noteRepository.findOne({
      where: { id: createdNoteId },
    });
    expect(noteInDb).toBeNull();

    pathInDb = await pathRepository.findOne({
      where: { id: createdPathId },
    });
    expect(pathInDb).toBeNull();

    visionBoardInDb = await visionBoardRepository.findOne({
      where: { id: createdVisionBoardId },
    });
    expect(visionBoardInDb).toBeNull();

    pushTokenInDb = await notificationPushTokenRepository.findOne({
      where: { token: pushToken },
    });
    expect(pushTokenInDb).toBeNull();

    entitlementInDb = await accountEntitlementRepository.findOne({
      where: { accountId: user.id },
    });
    expect(entitlementInDb).toBeNull();
  });

  it('given existing account without profile, deleting it should still succeed', async () => {
    const user = await app.signedInVerifiedAccount({
      createProfile: false,
      premiumEntitlement: true,
    });

    const pushToken = `token-${uuid()}`;
    const registerPushTokenRes = await user.notificationAPI.registerPushToken({
      token: pushToken,
    });
    expect(registerPushTokenRes.status).toEqual(HttpStatus.NO_CONTENT);

    let entitlementInDb = await accountEntitlementRepository.findOne({
      where: { accountId: user.id },
    });
    expect(entitlementInDb).toBeTruthy();
    let pushTokenInDb = await notificationPushTokenRepository.findOne({
      where: { token: pushToken },
    });
    expect(pushTokenInDb).toBeTruthy();

    const deleteRes = await user.accountAPI.deleteMyAccount();
    expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);
    expect(deleteRes.body).toEqual({});

    const accountInDb = await accountRepository.findOne({
      where: { id: user.id },
    });
    expect(accountInDb).toBeNull();

    entitlementInDb = await accountEntitlementRepository.findOne({
      where: { accountId: user.id },
    });
    expect(entitlementInDb).toBeNull();
    pushTokenInDb = await notificationPushTokenRepository.findOne({
      where: { token: pushToken },
    });
    expect(pushTokenInDb).toBeNull();
  });

  it('given another account exists, deleting my account should not remove it', async () => {
    const user = await app.signedInVerifiedAccount();
    const anotherUser = await app.signedInVerifiedAccount();

    const deleteRes = await user.accountAPI.deleteMyAccount();
    expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);

    const deletedAccount = await accountRepository.findOne({
      where: { id: user.id },
    });
    expect(deletedAccount).toBeNull();

    const otherAccount = await accountRepository.findOne({
      where: { id: anotherUser.id },
    });
    expect(otherAccount).toBeTruthy();
  });
});
