import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';

export enum ReportPeriod {
  ALL = 'all',
  CURRENT = 'current',
  PREVIOUS = 'previous',
}

export class QueryReportDto {
  @IsOptional()
  @IsUUID()
  farmId?: string;

  @IsOptional()
  @IsUUID()
  fieldId?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;
}
