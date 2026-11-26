import {
  IsString,
  IsEmail,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsOptional()
  remember?: boolean;
}
