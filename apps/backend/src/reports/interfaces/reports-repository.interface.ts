import type { QueryReportDto } from '../dto/query-report.dto.js';

export interface ReportFilters {
  companyId: string;
  farmId?: string;
  fieldId?: string;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportContext {
  generatedAt: string;
  companyName: string;
  filters: {
    farmId?: string | null;
    farmName?: string | null;
    fieldId?: string | null;
    fieldName?: string | null;
    campaignId?: string | null;
    campaignName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
}

export interface Variation {
  previousValue: number;
  variationPercent: number;
}

export interface FieldBucket {
  fieldId: string;
  fieldName: string;
  areaHectares: number;
  tons: number;
  tonsPerHectare: number;
  percentage: number;
}

export interface CampaignBucket {
  campaignId: string;
  campaignName: string;
  campaignCode: string;
  value: number;
  percentage: number;
}

export interface MonthBucket {
  year: number;
  month: string;
  value: number;
}

export interface ProductionReport extends ReportContext {
  totalTons: number;
  totalHarvests: number;
  averageTonsPerHectare: number;
  averageSucrose: number;
  totalAreaHectares: number;
  byField: FieldBucket[];
  byCampaign: CampaignBucket[];
  byMonth: MonthBucket[];
  bestField: { fieldId: string; fieldName: string; tonsPerHectare: number } | null;
  worstField: { fieldId: string; fieldName: string; tonsPerHectare: number } | null;
  variation: Variation | null;
}

export interface CategoryBucket {
  categoryId: string;
  categoryName: string;
  color: string | null;
  total: number;
  percentage: number;
}

export interface CostReport extends ReportContext {
  totalAmount: number;
  totalCosts: number;
  costPerHectare: number;
  costPerTon: number;
  averageMonthlyCost: number;
  byCategory: CategoryBucket[];
  byField: { fieldId: string; fieldName: string; total: number; percentage: number }[];
  byCampaign: CampaignBucket[];
  byMonth: MonthBucket[];
  variation: Variation | null;
}

export interface ProfitabilityBucket {
  fieldId: string;
  fieldName: string;
  tons: number;
  areaHectares: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface ProfitabilityReport extends ReportContext {
  pricePerTon: number;
  revenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  roi: number;
  profitabilityPerHectare: number;
  profitabilityPerTon: number;
  byField: ProfitabilityBucket[];
  byCampaign: { campaignId: string; campaignName: string; revenue: number; cost: number; profit: number; margin: number }[];
  bestField: { fieldId: string; fieldName: string; profit: number; margin: number } | null;
  worstField: { fieldId: string; fieldName: string; profit: number; margin: number } | null;
  bestCampaign: { campaignId: string; campaignName: string; profit: number; margin: number } | null;
}

export interface FieldReportRow {
  fieldId: string;
  fieldName: string;
  farmName: string;
  areaHectares: number;
  status: string | null;
  varietyName: string | null;
  ratoonNumber: number;
  healthScore: number | null;
  shiScore: number | null;
  shiLevel: string | null;
  estimatedProduction: number | null;
  tons: number;
  totalCost: number;
  lastActivityAt: string | null;
}

export interface FieldsReport extends ReportContext {
  totalFields: number;
  totalAreaHectares: number;
  averageShi: number;
  averageHealthScore: number;
  byField: FieldReportRow[];
}

export interface ActivityBucket {
  activityTypeId: string;
  activityTypeName: string;
  icon: string | null;
  count: number;
  percentage: number;
}

export interface ActivitiesReport extends ReportContext {
  totalActivities: number;
  byType: ActivityBucket[];
  byField: { fieldId: string; fieldName: string; count: number; percentage: number }[];
  byMonth: MonthBucket[];
  recent: { id: string; title: string; activityDate: string; fieldName: string; activityTypeName: string }[];
}

export interface CampaignReportRow {
  campaignId: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  totalTons: number;
  totalCost: number;
  revenue: number;
  profit: number;
  margin: number;
}

export interface CampaignsReport extends ReportContext {
  campaigns: CampaignReportRow[];
  bestCampaign: { campaignId: string; campaignName: string; profit: number; margin: number } | null;
  productionVariation: Variation | null;
  costVariation: Variation | null;
}

export interface SummaryReport extends ReportContext {
  production: {
    totalTons: number;
    averageTonsPerHectare: number;
    bestField: { fieldId: string; fieldName: string; tonsPerHectare: number } | null;
  };
  costs: { totalAmount: number; costPerHectare: number; costPerTon: number };
  profitability: { revenue: number; profit: number; margin: number; roi: number };
  fields: { totalFields: number; totalAreaHectares: number; averageShi: number };
  activities: { totalActivities: number };
  campaigns: { activeCampaign: string | null; bestCampaign: string | null };
  alerts: { total: number; critical: number; high: number };
  overallScore: number;
}

export interface IReportsRepository {
  getContext(filters: ReportFilters): Promise<ReportContext>;
  getProduction(filters: ReportFilters): Promise<Omit<ProductionReport, keyof ReportContext> & { variation: Variation | null }>;
  getCosts(filters: ReportFilters): Promise<Omit<CostReport, keyof ReportContext> & { variation: Variation | null }>;
  getProfitability(filters: ReportFilters, pricePerTon: number): Promise<Omit<ProfitabilityReport, keyof ReportContext>>;
  getFields(filters: ReportFilters): Promise<Omit<FieldsReport, keyof ReportContext>>;
  getActivities(filters: ReportFilters): Promise<Omit<ActivitiesReport, keyof ReportContext>>;
  getCampaigns(filters: ReportFilters): Promise<Omit<CampaignsReport, keyof ReportContext>>;
  getSummary(filters: ReportFilters): Promise<Omit<SummaryReport, keyof ReportContext>>;
  getPricePerTon(companyId: string): Promise<number>;
  listFarms(companyId: string): Promise<{ id: string; name: string }[]>;
  listFields(companyId: string): Promise<{ id: string; name: string; farmId: string }[]>;
  listCampaigns(companyId: string): Promise<{ id: string; code: string; name: string; isActive: boolean }[]>;
}
