import { UserProfileFacade } from '@domain/user-profile/user-profile.facade';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { UserProfileDto } from '@domain/user-profile/application';

import { CurrentUser, RequiredAuth } from '../decorators';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthUser } from '../authentication';

@RequiredAuth({
  hasUserProfile: false,
})
@Controller('users/me/profile')
export class UserProfileController {
  constructor(private readonly userProfileFacade: UserProfileFacade) {}

  @Get()
  async getProfile(@CurrentUser() authUser: AuthUser): Promise<UserProfileDto> {
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: authUser.accountId,
    });
    return UserProfileDto.create(userProfile, authUser.hasPremiumEntitlement);
  }

  @Post()
  async createProfile(
    @CurrentUser() authUser: AuthUser,
    @Body() body: CreateUserProfileDto,
  ): Promise<UserProfileDto> {
    await this.userProfileFacade.createUser({
      accountId: authUser.accountId,
      username: body.username,
      countryCode: body.countryCode,
      language: body.language,
      belief: body.belief,
      biography: body.biography,
    });
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: authUser.accountId,
    });
    return UserProfileDto.create(userProfile, authUser.hasPremiumEntitlement);
  }

  @Put()
  async updateProfile(
    @CurrentUser() authUser: AuthUser,
    @Body() body: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    await this.userProfileFacade.updateUserProfile({
      accountId: authUser.accountId,
      username: body.username,
      countryCode: body.countryCode,
      belief: body.belief,
      biography: body.biography,
      language: body.language,
    });
    const userProfile = await this.userProfileFacade.getByAccountId({
      accountId: authUser.accountId,
    });
    return UserProfileDto.create(userProfile, authUser.hasPremiumEntitlement);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@CurrentUser() authUser: AuthUser): Promise<void> {
    await this.userProfileFacade.deleteUserProfile({
      accountId: authUser.accountId,
    });
  }
}
