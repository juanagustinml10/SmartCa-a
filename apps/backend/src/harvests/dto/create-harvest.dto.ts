import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MinLength,
  IsDateString,
} from 'class-validator';

export class CreateHarvestDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  @IsOptional()
  farmId?: string;

  @IsUUID()
  fieldId: string;

  @IsUUID()
  campaignId: string;

  @IsUUID()
  @IsOptional()
  varietyId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  responsible?: string;

  @IsString()
  @MinLength(2)
  method: string;

  @IsNumber()
  @Min(0)
  tons: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tonsPerHectare?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedYield?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  sucrosePercentage?: number;

  @IsString()
  @IsOptional()
  qualityGrade?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  humidity?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  attachments?: Record<string, unknown>[];

  @IsString()
  @IsOptional()
  observations?: string;
}
