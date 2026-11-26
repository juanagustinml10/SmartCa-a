export type HarvestStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type QualityGrade = 'A' | 'B' | 'C';

export interface Harvest {
  id: string;
  companyId: string;
  farmId?: string;
  farmName?: string;
  fieldId: string;
  fieldName?: string;
  campaignId: string;
  campaignName?: string;
  varietyId?: string;
  varietyName?: string;
  startDate: string;
  endDate?: string;
  responsible?: string;
  method: string;
  tons: number;
  tonsPerHectare?: number;
  estimatedYield?: number;
  sucrosePercentage?: number;
  qualityGrade?: QualityGrade;
  humidity?: number;
  status: HarvestStatus;
  attachments?: Record<string, unknown>[];
  observations?: string;
  createdAt: string;
}

export interface HarvestFiltersState {
  search: string;
  companyId: string;
  farmId: string;
  fieldId: string;
  campaignId: string;
  varietyId: string;
  status: string;
  startDate: string;
  endDate: string;
}

export type HarvestView = 'dashboard' | 'byField' | 'byCampaign' | 'byVariety' | 'byMonth';

export interface HarvestAnalytics {
  totalTons: number;
  averageTonsPerHectare: number;
  totalByField: { fieldId: string; fieldName: string; tons: number; percentage: number }[];
  totalByCampaign: { campaignId: string; campaignName: string; tons: number }[];
  totalByMonth: { month: string; year: number; tons: number }[];
  bestField: { fieldId: string; fieldName: string; tonsPerHectare: number } | null;
  worstField: { fieldId: string; fieldName: string; tonsPerHectare: number } | null;
  averageSucrose: number;
  totalHarvests: number;
}
