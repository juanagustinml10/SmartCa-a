import { IsString, MinLength } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @MinLength(1)
  key: string;

  @IsString()
  value: string;
}
