export interface ExecutiveKpi {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: string;
  color: 'brand' | 'accent' | 'info' | 'warning' | 'error';
  decimals?: number;
  tooltip: string;
  category: 'production' | 'cost' | 'shi' | 'alerts' | 'ia' | 'climate';
}

export interface GlobalFilters {
  companyId: string | null;
  farmId: string | null;
  fieldId: string | null;
  campaignId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  category: string | null;
  supplierId: string | null;
  status: string | null;
}

export interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

export interface LayoutConfig {
  fullscreen: boolean;
  sidebarCompact: boolean;
  detailPanel: boolean;
  filtersVisible: boolean;
  detailPanelWidth: number;
  widgets: Record<string, WidgetConfig>;
}

export interface TimelineEvent {
  id: string;
  type: 'activity' | 'cost' | 'harvest' | 'alert' | 'event' | 'ia_query';
  title: string;
  description: string;
  timestamp: string;
  fieldId?: string;
  fieldName?: string;
  amount?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface IARecommendation {
  id: string;
  type: 'risk' | 'opportunity' | 'warning' | 'insight';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface SyncState {
  selectedCategory: string | null;
  selectedFieldId: string | null;
  selectedCampaign: string | null;
}

export type WidgetId = 'kpis' | 'map' | 'ia' | 'timeline' | 'charts' | 'alerts';

export interface ExportConfig {
  dashboard: boolean;
  pdf: boolean;
  image: boolean;
  powerpoint: boolean;
  excel: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  widgetOrder: string[];
  pinnedWidgets: string[];
  defaultFilters: Partial<GlobalFilters>;
}

export interface IASummary {
  dailySummary: string;
  mainRecommendation: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  productionPrediction: { value: number; unit: string; confidence: number };
  financialPrediction: { value: number; unit: string; confidence: number };
  smartAlerts: number;
  lastUpdated: string;
}

export interface ConnectionStatus {
  database: 'connected' | 'disconnected' | 'error';
  api: 'connected' | 'disconnected' | 'error';
  gis: 'connected' | 'disconnected' | 'error';
  ia: 'connected' | 'disconnected' | 'error';
}
