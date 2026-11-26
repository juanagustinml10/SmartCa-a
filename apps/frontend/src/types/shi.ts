export type ShiLevel = 'excelente' | 'bueno' | 'regular' | 'critico';

export interface ShiInput {
  fieldId: string;
  healthScore: number | null;
  status: string;
  activeAlerts: number;
  recentActivities: number;
  activityDelays: number;
  historicalProduction: number | null;
  accumulatedCosts: number;
  sanitaryCondition: 'good' | 'fair' | 'poor' | 'unknown';
}

export interface ShiBreakdown {
  healthScore: number;
  fieldStatus: number;
  alerts: number;
  activities: number;
  production: number;
  costs: number;
  sanitary: number;
}

export interface ShiResult {
  score: number;
  level: ShiLevel;
  breakdown: ShiBreakdown;
  calculatedAt: Date;
}
