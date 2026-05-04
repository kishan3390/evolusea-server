import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { v4 as uuid } from 'uuid';
import { PathStatus } from '../../../src/domain/path/domain';
import { Repository } from 'typeorm';
import { PathEntity } from '../../../src/domain/path/infrastructure/entities';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Restore path (e2e)', () => {
  let app: TestApp;
  let user: SignedInAccount;
  let pathRepository: Repository<PathEntity>;

  beforeEach(async (context) => {
    app = context.app;
    pathRepository = app.getProvider(getRepositoryToken(PathEntity));

    user = await app.signedInVerifiedAccount();
  });

  it('given non-existing path, restoring it should fail', async () => {
    const res = await user.pathAPI.restorePath(uuid());
    expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given completed path, restoring it should succeed', async () => {
    const createRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: new Date().toISOString(),
    });
    expect(createRes.status).toEqual(HttpStatus.CREATED);
    const pathId = createRes.body.id;
    const completeRes = await user.pathAPI.completePath(pathId);
    expect(completeRes.status).toEqual(HttpStatus.CREATED);
    const restoreRes = await user.pathAPI.restorePath(pathId);
    expect(restoreRes.status).toEqual(HttpStatus.CREATED);
  });

  it('given already restored path, restoring it should fail', async () => {
    const createRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: new Date().toISOString(),
    });
    expect(createRes.status).toEqual(HttpStatus.CREATED);
    const pathId = createRes.body.id;
    const completeRes = await user.pathAPI.completePath(pathId);
    expect(completeRes.status).toEqual(HttpStatus.CREATED);
    const restoreRes1 = await user.pathAPI.restorePath(pathId);
    expect(restoreRes1.status).toEqual(HttpStatus.CREATED);
    const restoreRes2 = await user.pathAPI.restorePath(pathId);
    expect(restoreRes2.status).toEqual(HttpStatus.CONFLICT);
  });

  it('given created path with "overdue" status, restoring it should fail', async () => {
    const createRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: new Date().toISOString(),
    });
    expect(createRes.status).toEqual(HttpStatus.CREATED);
    const pathId = createRes.body.id;

    await pathRepository.update(pathId, { status: PathStatus.Overdue });
    const path = await user.pathAPI.getPath(pathId);
    expect(path.body.status).toEqual(PathStatus.Overdue);

    const restoreRes = await user.pathAPI.restorePath(pathId);
    expect(restoreRes.status).toEqual(HttpStatus.CONFLICT);
  });
});
