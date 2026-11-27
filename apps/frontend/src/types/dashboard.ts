export interface KpiData {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  icon: string;
  color: "brand" | "accent" | "info" | "warning" | "error";
  decimals?: number;
}

export interface ProductionDataPoint {
  campaign: string;
  production: number;
  yield_: number;
  target: number;
}

export interface CostDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface AlertData {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  timestamp: string;
  actionable: boolean;
}

export interface ActivityData {
  id: string;
  type: "harvest" | "fertilization" | "irrigation" | "control" | "soil" | "planting" | "report" | "ai";
  title: string;
  description: string;
  timestamp: string;
  field?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
}

export interface WeatherData {
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "partly-cloudy";
  humidity: number;
  windSpeed: number;
  maxTemp: number;
  minTemp: number;
}

export interface CampaignData {
  id: string;
  label: string;
  isActive: boolean;
}

/* Respuesta de GET /api/dashboard, calculada en PostgreSQL. */

export interface DashboardCampaign {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface DashboardFilters {
  from: string | null;
  to: string | null;
  campaignId: string | null;
}

export interface DashboardMetrics {
  farms: number;
  fields: number;
  areaHectares: number;
  activities: number;
  costsTotal: number;
  harvests: number;
  productionTons: number;
  activeAlerts: number;
  averageShi: number | null;
  costPerHectare: number | null;
}

export interface DashboardTrend {
  percent: number | null;
  previous: number;
}

export interface DashboardTrends {
  activities: DashboardTrend | null;
  costsTotal: DashboardTrend | null;
  productionTons: DashboardTrend | null;
  activeAlerts: DashboardTrend | null;
}

export interface DashboardFieldStatus {
  code: string;
  name: string;
  count: number;
  areaHectares: number;
}

export interface DashboardCostCategory {
  id: string;
  name: string;
  color: string;
  total: number;
}

export interface DashboardCostPoint {
  month: string;
  total: number;
}

export interface DashboardProductionPoint {
  campaignCode: string;
  campaignName: string;
  production: number;
  yieldPerHectare: number;
  target: number;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  timestamp: string;
  field: string | null;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  field: string | null;
}

export interface DashboardField {
  id: string;
  name: string;
  farmName: string;
  areaHectares: number;
  statusCode: string;
  statusName: string;
  healthScore: number | null;
  shiScore: number | null;
  shiLevel: string | null;
  color: string | null;
}

export interface DashboardOverview {
  filters: DashboardFilters;
  campaigns: DashboardCampaign[];
  metrics: DashboardMetrics;
  trends: DashboardTrends;
  fieldStatus: DashboardFieldStatus[];
  costByCategory: DashboardCostCategory[];
  costByMonth: DashboardCostPoint[];
  productionByCampaign: DashboardProductionPoint[];
  alerts: DashboardAlert[];
  activities: DashboardActivity[];
  fields: DashboardField[];
}
