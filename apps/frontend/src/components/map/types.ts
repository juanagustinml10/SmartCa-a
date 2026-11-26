import type { FieldStatus } from '@/types/fields';

export interface GeoJsonPolygon {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: FieldGeoProperties;
}

export interface FieldGeoProperties {
  id: string;
  name: string;
  alias?: string;
  variety: string;
  campaign: string;
  status: FieldStatus;
  healthScore: number;
  areaHectares: number;
  estimatedProduction: number;
  color: string;
  farmName: string;
  soilType: string;
  plantingDate: string;
  lastActivity: string;
  lastActivityDate: string;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  selectedFieldId: string | null;
  layer: 'standard' | 'satellite' | 'terrain';
}

export interface MapFiltersState {
  status: FieldStatus | 'all';
  campaign: string;
  variety: string;
  healthRange: [number, number];
  search: string;
}

export interface SearchResult {
  id: string;
  type: 'field' | 'farm' | 'campaign';
  label: string;
  subtitle: string;
}
