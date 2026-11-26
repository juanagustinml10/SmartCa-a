import type { FieldStatus } from '@/types/fields';

export type BaseLayerId = 'osm' | 'satellite' | 'topographic' | 'hybrid';

export type MapLayerId =
  | 'fields'
  | 'alerts'
  | 'activities'
  | 'production'
  | 'costs'
  | 'weather';

export type ThematicMetric = 'shi' | 'production' | 'costs';

export type MeasurementMode = 'none' | 'distance' | 'area';

export interface HealthThreshold {
  min: number;
  max: number;
  color: string;
  label: string;
}

export interface GISFieldGeometry {
  type: 'Polygon';
  coordinates: number[][][];
  centroid: [number, number];
  perimeterMeters: number;
}

export interface GISFieldProperties {
  id: string;
  name: string;
  alias?: string;
  variety: string;
  campaign: string;
  status: FieldStatus;
  healthScore: number;
  areaHectares: number;
  perimeterMeters: number;
  estimatedProduction: number;
  costTotal: number;
  costPerHectare: number;
  companyId: string;
  companyName: string;
  farmName: string;
  soilType: string;
  irrigation: string;
  plantingDate: string;
  lastActivity: string;
  lastActivityDate: string;
}

export interface GISFeature {
  type: 'Feature';
  geometry: GISFieldGeometry;
  properties: GISFieldProperties;
}

export interface GISFilterState {
  companyId: string;
  campaign: string;
  status: FieldStatus | 'all';
  variety: string;
  shiRange: [number, number];
  productionRange: [number, number];
  search: string;
}

export interface WeatherCondition {
  time: string;
  code: 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm';
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

export interface GISWeather {
  current: WeatherCondition;
  forecast: WeatherCondition[];
  source: string;
  updatedAt: string;
}

export interface GISAlert {
  id: string;
  fieldId: string;
  type: 'clima' | 'cultivo' | 'monitoreo' | 'administrativo' | 'ia';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  position: [number, number];
}

export interface GISActivityPoint {
  id: string;
  fieldId: string;
  type: string;
  title: string;
  date: string;
  position: [number, number];
}

export type IARecommendationType = 'risk' | 'opportunity' | 'warning' | 'insight';

export interface GISIARecommendation {
  id: string;
  fieldId: string;
  type: IARecommendationType;
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

export interface MapLayerDefinition {
  id: MapLayerId;
  label: string;
  description: string;
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface GisViewState {
  center: [number, number];
  zoom: number;
  baseLayer: BaseLayerId;
  visibleLayers: Record<MapLayerId, boolean>;
  thematic: ThematicMetric;
  filters: GISFilterState;
  colorScale: HealthThreshold[];
  selectedFieldId: string | null;
  measurementMode: MeasurementMode;
  measurementPoints: [number, number][];
}
