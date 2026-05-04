import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsNotBeforeYesterday } from '../../decorators';

export class CreatePathPayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  description: string | null = null;

  @IsDateString()
  @IsNotEmpty()
  @IsNotBeforeYesterday()
  date: string;
}
