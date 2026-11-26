import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class CreateFieldDto {
  @IsUUID()
  farmId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.1)
  @Max(50000)
  areaHectares: number;

  @IsUUID()
  fieldStatusId: string;

  @IsUUID()
  @IsOptional()
  varietyId?: string;

  @IsString()
  @IsOptional()
  plantingDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  ratoonNumber?: number;

  @IsString()
  @IsOptional()
  soilType?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(14)
  soilPh?: number;

  @IsNumber()
  @IsOptional()
  estimatedProduction?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  healthScore?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  campaignCode?: string;
}
