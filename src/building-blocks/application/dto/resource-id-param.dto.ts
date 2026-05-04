import { IsString } from 'class-validator';

export class ResourceIdParamDto {
  @IsString()
  id: string;
}
