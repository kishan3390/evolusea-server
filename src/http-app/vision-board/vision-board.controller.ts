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
import { CurrentUser, RequiredAuth, UuidParam } from '../decorators';
import { AuthUser } from '../authentication';
import { VisionBoardFacade } from '@domain/vision-board/vision-board.facade';
import {
  CreateVisionBoardPayloadDto,
  ListVisionBoardsQueryDto,
  ListVisionBoardsResponseDto,
  UpdateVisionBoardPayloadDto,
  VisionBoardDto,
  VisionBoardQuotaDto,
  VisionBoardWithNestedDataDto,
} from './dto';
import { Pagination } from '@building-blocks/application';
import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';

@Controller('users/me/vision-boards')
@RequiredAuth()
export class VisionBoardController {
  constructor(
    private readonly visionBoardFacade: VisionBoardFacade,
    private readonly userProfileFacade: UserProfileFacade,
  ) {}

  @Post()
  async createVisionBoard(
    @Body() payload: CreateVisionBoardPayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<VisionBoardDto> {
    const quota = await this.visionBoardFacade.getVisionBoardsQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    if (!quota.create.isAllowed) {
      throw new ForbiddenException('Limit of vision boards reached');
    }

    const visionBoard = await this.visionBoardFacade.createVisionBoard({
      userProfileId: authUser.userProfileId,
      ...payload,
    });

    return VisionBoardDto.fromEntity({ visionBoard });
  }

  // Has to be placed before the /:id route to avoid path conflict
  @Get('/quota')
  async getVisionBoardQuota(
    @CurrentUser() authUser: AuthUser,
  ): Promise<VisionBoardQuotaDto> {
    const quota = await this.visionBoardFacade.getVisionBoardsQuota({
      userProfileId: authUser.userProfileId,
      accountIsPremium: authUser.hasPremiumEntitlement,
    });
    return VisionBoardQuotaDto.from(quota);
  }

  @Get('/:visionBoardId')
  async getVisionBoard(
    @UuidParam('visionBoardId') visionBoardId: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<VisionBoardWithNestedDataDto> {
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: authUser.accountId,
    });
    const visionBoardResult =
      await this.visionBoardFacade.getVisionBoardWithNestedData({
        visionBoardId,
        userProfileId: authUser.userProfileId,
        accountIsPremium: authUser.hasPremiumEntitlement,
      });

    if (!visionBoardResult.visionBoard) {
      throw new NotFoundException('Vision board not found');
    }

    return VisionBoardWithNestedDataDto.fromEntity({
      visionBoard: visionBoardResult.visionBoard,
      paths: visionBoardResult.paths,
      notes: visionBoardResult.notes,
      wisdomStories: visionBoardResult.wisdomStories,
      language: userProfile.getLanguage(),
    });
  }

  @Put('/:visionBoardId')
  async updateVisionBoard(
    @UuidParam('visionBoardId') visionBoardId: string,
    @Body() payload: UpdateVisionBoardPayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<VisionBoardDto> {
    const visionBoard = await this.visionBoardFacade.updateVisionBoard({
      userProfileId: authUser.userProfileId,
      visionBoardId: visionBoardId,
      ...payload,
    });

    return VisionBoardDto.fromEntity({ visionBoard });
  }

  @Delete('/:visionBoardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVisionBoard(
    @UuidParam('visionBoardId') visionBoardId: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<void> {
    await this.visionBoardFacade.deleteVisionBoard({
      visionBoardId,
      userProfileId: authUser.userProfileId,
    });
  }

  @Get()
  async listVisionBoards(
    @Query() query: ListVisionBoardsQueryDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<ListVisionBoardsResponseDto> {
    const boards = await this.visionBoardFacade.listVisionBoards({
      userProfileId: authUser.userProfileId,
      pagination: Pagination.from(query),
    });

    return ListVisionBoardsResponseDto.from(boards, (visionBoard) =>
      VisionBoardDto.fromEntity({ visionBoard }),
    );
  }
}
