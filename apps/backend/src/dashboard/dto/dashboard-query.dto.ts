import { IsDateString, IsOptional, IsUUID } from 'class-validator';

/** Filtros temporales del Dashboard. El `companyId` nunca viene del cliente. */
export class DashboardQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;
}
