import type {
  Cost,
  Supplier,
  CostCategory,
} from '../../generated/prisma/client.js';
import type { CreateCostDto } from '../dto/create-cost.dto.js';
import type { UpdateCostDto } from '../dto/update-cost.dto.js';
import type { QueryCostDto } from '../dto/query-cost.dto.js';

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

export interface CostWithRelations extends Cost {
  costCategory?: CostCategory | null;
  supplier?: Supplier | null;
  field?: { id: string; name: string } | null;
  farm?: { id: string; name: string } | null;
  campaign?: { id: string; code: string; name: string } | null;
  activity?: { id: string; title: string } | null;
  user?: { id: string; firstName: string; lastName: string } | null;
}

export interface CostAnalytics {
  totalAmount: number;
  totalByCategory: {
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
  }[];
  totalByField: {
    fieldId: string;
    fieldName: string;
    total: number;
    percentage: number;
  }[];
  totalByMonth: { month: string; year: number; total: number }[];
  totalByCampaign: {
    campaignId: string;
    campaignName: string;
    total: number;
  }[];
  costPerHectare: number;
  averageMonthlyCost: number;
}

export interface ICostsRepository {
  findAll(query: QueryCostDto): Promise<PaginatedResult<Cost>>;
  findById(id: string): Promise<CostWithRelations | null>;
  create(dto: CreateCostDto): Promise<Cost>;
  update(id: string, dto: UpdateCostDto): Promise<Cost>;
  softDelete(id: string): Promise<Cost>;
  getAnalytics(filters: {
    companyId?: string;
    farmId?: string;
    fieldId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CostAnalytics>;
}
