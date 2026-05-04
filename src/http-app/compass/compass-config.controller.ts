import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser, RequiredAuth } from '../decorators';
import { CompassConfigFacade } from '@domain/compass/compass-config.facade';
import { AuthUser } from '../authentication';
import { CompassConfigDto } from './dto/compass-config.dto';
import { CreateCompassConfigDto } from './dto/create-compass-config.dto';
import { UpdateCompassConfigDto } from './dto/update-compass-config.dto';

@Controller('users/me/compass/config')
@RequiredAuth()
export class CompassConfigController {
  constructor(private readonly compassConfigFacade: CompassConfigFacade) {}

  @Post()
  async createCompassConfig(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: CreateCompassConfigDto,
  ): Promise<CompassConfigDto> {
    const compassConfig = await this.compassConfigFacade.createCompassConfig({
      ...payload,
      userProfileId: authUser.userProfileId,
    });
    return CompassConfigDto.fromEntity(compassConfig);
  }

  @Get()
  async getCompassConfig(
    @CurrentUser() authUser: AuthUser,
  ): Promise<CompassConfigDto> {
    const compassConfig = await this.compassConfigFacade.getCompassConfig({
      userProfileId: authUser.userProfileId,
    });
    if (!compassConfig) {
      throw new NotFoundException('Compass config not found');
    }

    return CompassConfigDto.fromEntity(compassConfig);
  }

  @Put()
  async updateCompassConfig(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: UpdateCompassConfigDto,
  ): Promise<CompassConfigDto> {
    const compassConfig = await this.compassConfigFacade.updateCompassConfig({
      ...payload,
      userProfileId: authUser.userProfileId,
    });
    return CompassConfigDto.fromEntity(compassConfig);
  }
}
