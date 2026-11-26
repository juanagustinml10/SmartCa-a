'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  BaseLayerId,
  GISFilterState,
  HealthThreshold,
  MapLayerId,
  MeasurementMode,
  ThematicMetric,
} from '@/types/gis';
import type { Map } from 'leaflet';
import {
  DEFAULT_HEALTH_SCALE,
  MOCK_GIS_FEATURES,
  MOCK_GIS_FILTERS,
  MOCK_ALERTS,
  MOCK_ACTIVITIES,
  MOCK_WEATHER,
  MOCK_IA_RECOMMENDATIONS,
} from '@/lib/mock-gis';
import { getColorFromScale } from '@/lib/gis-utils';

interface GisContextValue {
  features: typeof MOCK_GIS_FEATURES;
  alerts: typeof MOCK_ALERTS;
  activities: typeof MOCK_ACTIVITIES;
  weather: typeof MOCK_WEATHER;
  iaRecommendations: typeof MOCK_IA_RECOMMENDATIONS;
  filteredFeatures: typeof MOCK_GIS_FEATURES;
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  selectedFeature: (typeof MOCK_GIS_FEATURES)[number] | null;
  baseLayer: BaseLayerId;
  setBaseLayer: (layer: BaseLayerId) => void;
  visibleLayers: Record<MapLayerId, boolean>;
  toggleLayer: (layer: MapLayerId) => void;
  thematic: ThematicMetric;
  filters: GISFilterState;
  setFilters: (filters: GISFilterState) => void;
  resetFilters: () => void;
  colorScale: HealthThreshold[];
  setColorScale: (scale: HealthThreshold[]) => void;
  resetColorScale: () => void;
  measurementMode: MeasurementMode;
  setMeasurementMode: (mode: MeasurementMode) => void;
  measurementPoints: [number, number][];
  addMeasurementPoint: (point: [number, number]) => void;
  clearMeasurement: () => void;
  thematicColor: (score: number, production: number, costPerHa: number) => string;
  mapInstance: Map | null;
  setMapInstance: (map: Map) => void;
}

const GisContext = createContext<GisContextValue | null>(null);

const DEFAULT_LAYERS: Record<MapLayerId, boolean> = {
  fields: true,
  alerts: true,
  activities: false,
  production: false,
  costs: false,
  weather: false,
};

export function GisProvider({ children }: { children: ReactNode }) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [baseLayer, setBaseLayer] = useState<BaseLayerId>('osm');
  const [visibleLayers, setVisibleLayers] =
    useState<Record<MapLayerId, boolean>>(DEFAULT_LAYERS);
  const [filters, setFilters] = useState<GISFilterState>(MOCK_GIS_FILTERS);
  const [colorScale, setColorScale] =
    useState<HealthThreshold[]>(DEFAULT_HEALTH_SCALE);
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>('none');
  const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>(
    [],
  );
  const [mapInstance, setMapInstance] = useState<Map | null>(null);

  const toggleLayer = useCallback((layer: MapLayerId) => {
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(MOCK_GIS_FILTERS);
  }, []);

  const resetColorScale = useCallback(() => {
    setColorScale(DEFAULT_HEALTH_SCALE);
  }, []);

  const addMeasurementPoint = useCallback((point: [number, number]) => {
    setMeasurementPoints((prev) => [...prev, point]);
  }, []);

  const clearMeasurement = useCallback(() => {
    setMeasurementPoints([]);
  }, []);

  const thematic: ThematicMetric = visibleLayers.production
    ? 'production'
    : visibleLayers.costs
      ? 'costs'
      : 'shi';

  const filteredFeatures = useMemo(() => {
    return MOCK_GIS_FEATURES.filter((f) => {
      const p = f.properties;
      if (filters.companyId && p.companyId !== filters.companyId) return false;
      if (filters.campaign && p.campaign !== filters.campaign) return false;
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters.variety && p.variety !== filters.variety) return false;
      if (
        p.healthScore < filters.shiRange[0] ||
        p.healthScore > filters.shiRange[1]
      )
        return false;
      if (
        p.estimatedProduction < filters.productionRange[0] ||
        p.estimatedProduction > filters.productionRange[1]
      )
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.farmName.toLowerCase().includes(q) &&
          !p.companyName.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [filters]);

  const selectedFeature = useMemo(
    () =>
      MOCK_GIS_FEATURES.find((f) => f.properties.id === selectedFieldId) ?? null,
    [selectedFieldId],
  );

  const thematicColor = useCallback(
    (score: number, production: number, costPerHa: number) => {
      if (thematic === 'production') {
        const values = MOCK_GIS_FEATURES.map((f) => f.properties.estimatedProduction);
        const min = Math.min(...values, production);
        const max = Math.max(...values, production);
        const normalized = max === min ? 0.5 : (production - min) / (max - min);
        return bucketColor(normalized, false);
      }
      if (thematic === 'costs') {
        const values = MOCK_GIS_FEATURES.map((f) => f.properties.costPerHectare);
        const min = Math.min(...values, costPerHa);
        const max = Math.max(...values, costPerHa);
        const normalized = max === min ? 0.5 : (costPerHa - min) / (max - min);
        return bucketColor(normalized, true);
      }
      return getColorFromScale(score, colorScale);
    },
    [thematic, colorScale],
  );

  const value: GisContextValue = {
    features: MOCK_GIS_FEATURES,
    alerts: MOCK_ALERTS,
    activities: MOCK_ACTIVITIES,
    weather: MOCK_WEATHER,
    iaRecommendations: MOCK_IA_RECOMMENDATIONS,
    filteredFeatures,
    selectedFieldId,
    setSelectedFieldId,
    selectedFeature,
    baseLayer,
    setBaseLayer,
    visibleLayers,
    toggleLayer,
    thematic,
    filters,
    setFilters,
    resetFilters,
    colorScale,
    setColorScale,
    resetColorScale,
    measurementMode,
    setMeasurementMode,
    measurementPoints,
    addMeasurementPoint,
    clearMeasurement,
    thematicColor,
    mapInstance,
    setMapInstance,
  };

  return <GisContext.Provider value={value}>{children}</GisContext.Provider>;
}

function bucketColor(normalized: number, inverted: boolean): string {
  const v = inverted ? 1 - normalized : normalized;
  if (v >= 0.8) return '#15803D';
  if (v >= 0.6) return '#4ADE80';
  if (v >= 0.4) return '#FACC15';
  if (v >= 0.2) return '#F97316';
  return '#EF4444';
}

export function useGis(): GisContextValue {
  const ctx = useContext(GisContext);
  if (!ctx) throw new Error('useGis must be used within a GisProvider');
  return ctx;
}
