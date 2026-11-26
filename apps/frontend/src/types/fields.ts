export interface FieldData {
  id: string;
  name: string;
  alias?: string;
  surfaceHa: number;
  variety: string;
  campaign: string;
  status: FieldStatus;
  estimatedProduction: number;
  healthScore: number;
  lastActivity: string;
  lastActivityDate: string;
  color: string;
  location: { lat: number; lng: number };
  plantingDate: string;
  soilType: string;
  soilPh: number;
  irrigation: string;
  historicalProduction: HistoricalProduction[];
  costs: FieldCost[];
  activities: FieldActivity[];
  alerts: FieldAlert[];
}

export type FieldStatus = "active" | "inactive" | "harvesting" | "resting";

export type FieldSortKey = "name" | "surfaceHa" | "estimatedProduction" | "healthScore";

export type ViewMode = "cards" | "table";

export interface HistoricalProduction {
  campaign: string;
  production: number;
  yield_: number;
}

export interface FieldCost {
  category: string;
  value: number;
}

export interface FieldActivity {
  id: string;
  type: string;
  title: string;
  date: string;
}

export interface FieldAlert {
  id: string;
  type: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface FieldFiltersState {
  search: string;
  status: FieldStatus | "all";
  variety: string;
  campaign: string;
  sortKey: FieldSortKey;
  sortAsc: boolean;
}

export const STATUS_CONFIG: Record<FieldStatus, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: "Activo", bg: "bg-success-50 dark:bg-success-950/20", text: "text-success-600 dark:text-success-500", dot: "bg-success-500" },
  inactive: { label: "Inactivo", bg: "bg-bg-subtle", text: "text-text-tertiary", dot: "bg-text-tertiary" },
  harvesting: { label: "En cosecha", bg: "bg-accent-50 dark:bg-accent-950/20", text: "text-accent-600 dark:text-accent-500", dot: "bg-accent-500" },
  resting: { label: "En descanso", bg: "bg-info-50 dark:bg-info-950/20", text: "text-info-600 dark:text-info-500", dot: "bg-info-500" },
};

export function getHealthScoreConfig(score: number) {
  if (score >= 80) return { label: "Excelente", color: "text-success-500", bg: "bg-success-50 dark:bg-success-950/20", bar: "bg-success-500", ring: "stroke-success-500" };
  if (score >= 60) return { label: "Bueno", color: "text-info-500", bg: "bg-info-50 dark:bg-info-950/20", bar: "bg-info-500", ring: "stroke-info-500" };
  if (score >= 40) return { label: "Regular", color: "text-warning-500", bg: "bg-warning-50 dark:bg-warning-950/20", bar: "bg-warning-500", ring: "stroke-warning-500" };
  return { label: "Crítico", color: "text-error-500", bg: "bg-error-50 dark:bg-error-950/20", bar: "bg-error-500", ring: "stroke-error-500" };
}
