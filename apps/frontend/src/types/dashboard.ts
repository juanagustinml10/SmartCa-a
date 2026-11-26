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
