import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PathFacade } from '@domain/path/path.facade';
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import {
  PathDto,
  CreatePathPayloadDto,
  ListPathsResponseDto,
  UpdatePathPayloadDto,
  PathsQuotaDto,
  ListPathsQueryDto,
} from './dto';
import { ApiResponse } from '@nestjs/swagger';
import { Pagination } from '@building-blocks/application';

@Controller('users/me/paths')
@RequiredAuth()
export class PathController {
  constructor(private readonly pathFacade: PathFacade) {}

  @Post()
  async createPath(
    @Body() payload: CreatePathPayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<PathDto> {
        const quota = await this.pathFacade.getPathsQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    if (!quota.create.isAllowed) {
      throw new ForbiddenException('Limit of paths reached');
    }

    const path = await this.pathFacade.createPath({
      ...payload,
      userProfileId: authUser.userProfileId,
    });
    return PathDto.fromEntity(path);
  }

  // Has to be placed before the /:id route to avoid path conflict
  @Get('/quota')
  async getNoteQuota(
    @CurrentUser() authUser: AuthUser,
  ): Promise<PathsQuotaDto> {
    const data = await this.pathFacade.getPathsQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    return PathsQuotaDto.fromEntity(data);
  }

  @Get('/:id')
  async getPath(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<PathDto> {
    const path = await this.pathFacade.getPath({
      userProfileId: authUser.userProfileId,
      id,
    });
    if (!path) throw new NotFoundException();
    return PathDto.fromEntity(path);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePath(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<void> {
    await this.pathFacade.deletePath({
      userProfileId: authUser.userProfileId,
      pathId: id,
    });
  }

  @Put('/:id')
  async updatePath(
    @UuidParam('id') id: string,
    @Body() payload: UpdatePathPayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<PathDto> {
    const path = await this.pathFacade.updatePath({
      userProfileId: authUser.userProfileId,
      pathId: id,
      ...payload,
    });
    return PathDto.fromEntity(path);
  }

  @Get()
  @ApiResponse({ type: ListPathsResponseDto, status: HttpStatus.OK })
  async listMyPaths(
    @Query() query: ListPathsQueryDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<ListPathsResponseDto> {
    const results = await this.pathFacade.listPaths({
      userProfileId: authUser.userProfileId,
      createdFrom: query.createdFrom ? new Date(query.createdFrom) : undefined,
      createdTo: query.createdTo ? new Date(query.createdTo) : undefined,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      pagination: Pagination.from(query),
    });
    return ListPathsResponseDto.from(results, PathDto.fromEntity);
  }

  @Post('/:id/complete')
  async completePath(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<PathDto> {
    const path = await this.pathFacade.completePath({
      userProfileId: authUser.userProfileId,
      id,
    });
    return PathDto.fromEntity(path);
  }

  @Post('/:id/restore')
  async restorePath(
    @UuidParam('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<PathDto> {
    const path = await this.pathFacade.restorePath({
      userProfileId: authUser.userProfileId,
      id,
    });
    return PathDto.fromEntity(path);
  }
}
