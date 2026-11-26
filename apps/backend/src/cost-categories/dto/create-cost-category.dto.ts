import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCostCategoryDto {
  @IsString()
  @MinLength(2)
  code: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}
