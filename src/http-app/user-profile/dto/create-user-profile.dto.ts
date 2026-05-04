import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CountryCodes,
  BeliefSystems,
  Languages,
} from '@domain/user-profile/domain';

export class CreateUserProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  @Matches(/^(?![_-])[A-Za-z0-9\u0E00-\u0E7F_-]{1,30}$/, {
    message:
      'Username must be 1-30 characters long, can contain letters, numbers, Thai characters, underscores, and hyphens, but cannot start with underscore or hyphen',
  })
  username: string;

  @IsEnum(CountryCodes)
  countryCode: CountryCodes;

  @IsEnum(BeliefSystems)
  belief: BeliefSystems;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  biography?: string;

  @IsEnum(Languages)
  language: Languages;
}
