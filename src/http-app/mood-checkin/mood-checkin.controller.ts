import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth } from '../decorators';
import { AuthUser } from '../authentication';
import { MoodCheckinFacade } from '@domain/mood-checkin/mood-checkin.facade';
import {
  CreateMoodCheckinPayloadDto,
  ListMoodCheckinsQueryDto,
  ListMoodCheckinsResponseDto,
  MoodCheckinDto,
} from './dto';
import { Pagination } from '@building-blocks/application';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users/me/mood-checkins')
@RequiredAuth()
export class MoodCheckinController {
  constructor(private readonly moodCheckinFacade: MoodCheckinFacade) {}

  @Post()
  async createMoodCheckin(
    @Body() payload: CreateMoodCheckinPayloadDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<MoodCheckinDto> {
    const moodCheckin = await this.moodCheckinFacade.createMoodCheckin({
      mood: payload.mood,
      userProfileId: authUser.userProfileId,
    });
    return MoodCheckinDto.fromEntity(moodCheckin);
  }

  @Get('/latest')
  async getLatestMoodCheckin(
    @CurrentUser() authUser: AuthUser,
  ): Promise<MoodCheckinDto> {
    const moodCheckin = await this.moodCheckinFacade.getLatestMoodCheckin({
      userProfileId: authUser.userProfileId,
    });
    if (!moodCheckin) throw new NotFoundException();
    return MoodCheckinDto.fromEntity(moodCheckin);
  }

  @Get()
  @ApiResponse({ type: ListMoodCheckinsResponseDto, status: HttpStatus.OK })
  async listMoodCheckins(
    @Query() query: ListMoodCheckinsQueryDto,
    @CurrentUser() authUser: AuthUser,
  ): Promise<ListMoodCheckinsResponseDto> {
    const results = await this.moodCheckinFacade.listMoodCheckins({
      userProfileId: authUser.userProfileId,
      createdFrom: query.createdFrom ? new Date(query.createdFrom) : undefined,
      createdTo: query.createdTo ? new Date(query.createdTo) : undefined,
      pagination: Pagination.from(query),
    });
    return ListMoodCheckinsResponseDto.from(results, MoodCheckinDto.fromEntity);
  }
}
