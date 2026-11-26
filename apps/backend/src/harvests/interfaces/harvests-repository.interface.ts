import type { Harvest } from '../../generated/prisma/client.js';
import type { CreateHarvestDto } from '../dto/create-harvest.dto.js';
import type { UpdateHarvestDto } from '../dto/update-harvest.dto.js';
import type { QueryHarvestDto } from '../dto/query-harvest.dto.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface HarvestWithRelations extends Harvest {
  field?: { id: string; name: string } | null;
  farm?: { id: string; name: string } | null;
  campaign?: { id: string; code: string; name: string } | null;
  variety?: { id: string; code: string; name: string } | null;
}

export interface HarvestAnalytics {
  totalTons: number;
  averageTonsPerHectare: number;
  totalByField: {
    fieldId: string;
    fieldName: string;
    tons: number;
    percentage: number;
  }[];
  totalByCampaign: { campaignId: string; campaignName: string; tons: number }[];
  totalByMonth: { month: string; year: number; tons: number }[];
  bestField: {
    fieldId: string;
    fieldName: string;
    tonsPerHectare: number;
  } | null;
  worstField: {
    fieldId: string;
    fieldName: string;
    tonsPerHectare: number;
  } | null;
  averageSucrose: number;
  totalHarvests: number;
}

export interface IHarvestsRepository {
  findAll(query: QueryHarvestDto): Promise<PaginatedResult<Harvest>>;
  findById(id: string): Promise<HarvestWithRelations | null>;
  create(dto: CreateHarvestDto): Promise<Harvest>;
  update(id: string, dto: UpdateHarvestDto): Promise<Harvest>;
  softDelete(id: string): Promise<Harvest>;
  getAnalytics(filters: {
    companyId?: string;
    farmId?: string;
    fieldId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HarvestAnalytics>;
}
