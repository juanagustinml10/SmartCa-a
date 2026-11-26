import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateCostDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  @IsOptional()
  farmId?: string;

  @IsUUID()
  @IsOptional()
  fieldId?: string;

  @IsUUID()
  costCategoryId: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsUUID()
  @IsOptional()
  activityId?: string;

  @IsUUID()
  campaignId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  costDate: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}
