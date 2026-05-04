import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { v4 as uuid } from 'uuid';
import { PathStatus } from '../../../src/domain/path/domain';
import { Repository } from 'typeorm';
import { PathEntity } from '../../../src/domain/path/infrastructure/entities';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Complete path (e2e)', () => {
  let app: TestApp;
  let user: SignedInAccount;
  let pathRepository: Repository<PathEntity>;

  beforeEach(async (context) => {
    app = context.app;
    pathRepository = app.getProvider(getRepositoryToken(PathEntity));

    user = await app.signedInVerifiedAccount();
  });

  it('given non-existing path, completing it should fail', async () => {
    const res = await user.pathAPI.completePath(uuid());
    expect(res.status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('given created path with "overdue" status, completing it should succeed', async () => {
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

    const completeRes = await user.pathAPI.completePath(pathId);
    expect(completeRes.status).toEqual(HttpStatus.CREATED);

    const pathAfterCompletion = await user.pathAPI.getPath(pathId);
    expect(pathAfterCompletion.body.status).toEqual(PathStatus.Completed);
  });

  it('given created path with "awaiting" status, completing it should succeed', async () => {
    const createRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: new Date().toISOString(),
    });
    expect(createRes.status).toEqual(HttpStatus.CREATED);
    expect(createRes.body.status).toEqual(PathStatus.Awaiting);
    const pathId = createRes.body.id;
    const completeRes = await user.pathAPI.completePath(pathId);
    expect(completeRes.status).toEqual(HttpStatus.CREATED);
  });

  it('given already completed path, completing it should fail', async () => {
    const createRes = await user.pathAPI.createPath({
      title: 'My path',
      description: 'My path description',
      date: new Date().toISOString(),
    });
    expect(createRes.status).toEqual(HttpStatus.CREATED);
    const pathId = createRes.body.id;
    const res1 = await user.pathAPI.completePath(pathId);
    expect(res1.status).toEqual(HttpStatus.CREATED);
    const res2 = await user.pathAPI.completePath(pathId);
    expect(res2.status).toEqual(HttpStatus.CONFLICT);
  });
});
