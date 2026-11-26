import type {
  GISFeature,
  GISFilterState,
  GISAlert,
  GISActivityPoint,
  GISWeather,
  GISIARecommendation,
  HealthThreshold,
  CompanyOption,
} from '@/types/gis';
import { MOCK_FIELDS } from '@/lib/mock-fields';
import { generateFieldPolygon } from '@/components/map/polygon-utils';
import {
  computeRingPerimeter,
  computeRingCentroid,
  ringAreaHectares,
} from '@/lib/gis-utils';

export const DEFAULT_HEALTH_SCALE: HealthThreshold[] = [
  { min: 80, max: 100, color: '#15803D', label: 'Excelente' },
  { min: 60, max: 79, color: '#4ADE80', label: 'Bueno' },
  { min: 40, max: 59, color: '#FACC15', label: 'Atención' },
  { min: 20, max: 39, color: '#F97316', label: 'Riesgo' },
  { min: 0, max: 19, color: '#EF4444', label: 'Crítico' },
];

export const MOCK_COMPANIES: CompanyOption[] = [
  { id: 'c1', name: 'Ingenio San Pablo' },
  { id: 'c2', name: 'Cooperativa Tucumana' },
  { id: 'c3', name: 'Agro Delicor' },
];

const COMPANY_BY_FIELD: Record<string, string> = {
  f1: 'c1', f2: 'c1', f3: 'c1', f4: 'c1',
  f5: 'c2', f6: 'c2', f7: 'c2', f8: 'c2',
  f9: 'c3', f10: 'c3', f11: 'c3', f12: 'c3',
};

function buildFeatures(): GISFeature[] {
  return MOCK_FIELDS.map((field, i) => {
    const rawRing = generateFieldPolygon(
      field.location.lat,
      field.location.lng,
      field.surfaceHa,
      i + 1,
    )[0] as [number, number][];

    const ring: [number, number][] = rawRing.map(([lng, lat]) => [lat, lng]);
    const perimeter = computeRingPerimeter(ring);
    const centroid = computeRingCentroid(ring);
    const measuredArea = ringAreaHectares(ring);
    const companyId = COMPANY_BY_FIELD[field.id] ?? 'c1';
    const companyName =
      MOCK_COMPANIES.find((c) => c.id === companyId)?.name ?? 'Ingenio San Pablo';
    const costTotal = field.costs.reduce((sum, c) => sum + c.value, 0);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[...rawRing]],
        centroid,
        perimeterMeters: perimeter,
      },
      properties: {
        id: field.id,
        name: field.name,
        alias: field.alias,
        variety: field.variety,
        campaign: field.campaign,
        status: field.status,
        healthScore: field.healthScore,
        areaHectares: measuredArea,
        perimeterMeters: perimeter,
        estimatedProduction: field.estimatedProduction,
        costTotal,
        costPerHectare: measuredArea > 0 ? costTotal / measuredArea : 0,
        companyId,
        companyName,
        farmName: 'Establecimiento Principal',
        soilType: field.soilType,
        irrigation: field.irrigation,
        plantingDate: field.plantingDate,
        lastActivity: field.lastActivity,
        lastActivityDate: field.lastActivityDate,
      },
    };
  });
}

export const MOCK_GIS_FEATURES: GISFeature[] = buildFeatures();

export const MOCK_GIS_FILTERS: GISFilterState = {
  companyId: '',
  campaign: '',
  status: 'all',
  variety: '',
  shiRange: [0, 100],
  productionRange: [0, 100000],
  search: '',
};

export const MOCK_ALERTS: GISAlert[] = [
  ...MOCK_FIELDS.flatMap((field) =>
    field.alerts.map((alert) => {
      const feature = MOCK_GIS_FEATURES.find((f) => f.properties.id === field.id);
      return {
        id: alert.id,
        fieldId: field.id,
        type:
          alert.type === 'warning' ? ('cultivo' as const) : ('monitoreo' as const),
        severity: alert.priority,
        title: alert.title,
        description: alert.title,
        position: feature?.geometry.centroid ?? [field.location.lat, field.location.lng],
      };
    }),
  ),
  {
    id: 'g-alert-1',
    fieldId: 'f3',
    type: 'clima',
    severity: 'critical',
    title: 'Riesgo de lluvias intensas',
    description: 'Precipitaciones >60mm previstas en 72h. Revisar drenaje de lotes bajos.',
    position: [-26.8201, -65.1956],
  },
  {
    id: 'g-alert-2',
    fieldId: 'f1',
    type: 'clima',
    severity: 'medium',
    title: 'Viento fuerte pronosticado',
    description: 'Ráfagas de hasta 45 km/h en la zona. Evaluar riesgo de vuelco.',
    position: [-26.8328, -65.2033],
  },
];

export const MOCK_ACTIVITIES: GISActivityPoint[] = MOCK_FIELDS.flatMap((field) => {
  const feature = MOCK_GIS_FEATURES.find((f) => f.properties.id === field.id);
  return field.activities.map((activity) => ({
    id: activity.id,
    fieldId: field.id,
    type: activity.type,
    title: activity.title,
    date: activity.date,
    position: feature?.geometry.centroid ?? [field.location.lat, field.location.lng],
  }));
});

export const MOCK_WEATHER: GISWeather = {
  current: {
    time: '2026-08-04T12:00:00',
    code: 'partly-cloudy',
    temperature: 32,
    precipitation: 0.2,
    humidity: 65,
    windSpeed: 12,
  },
  forecast: [
    { time: '2026-08-04T12:00:00', code: 'partly-cloudy', temperature: 32, precipitation: 0.2, humidity: 65, windSpeed: 12 },
    { time: '2026-08-05T12:00:00', code: 'rain', temperature: 28, precipitation: 18.4, humidity: 82, windSpeed: 22 },
    { time: '2026-08-06T12:00:00', code: 'storm', temperature: 26, precipitation: 42.0, humidity: 88, windSpeed: 34 },
    { time: '2026-08-07T12:00:00', code: 'cloudy', temperature: 27, precipitation: 3.1, humidity: 70, windSpeed: 15 },
    { time: '2026-08-08T12:00:00', code: 'clear', temperature: 33, precipitation: 0, humidity: 55, windSpeed: 9 },
  ],
  source: 'Open-Meteo (mock)',
  updatedAt: '2026-08-04T12:05:00',
};

export const MOCK_IA_RECOMMENDATIONS: GISIARecommendation[] = [
  {
    id: 'ia-r1',
    fieldId: 'f7',
    type: 'risk',
    title: 'Rendimiento crítico detectado',
    description: 'El SHI cayó 22 puntos en 30 días. Estrés hídrico probable por pH 5.5 fuera de rango. Intervención recomendada en 72h.',
    confidence: 94,
    impact: 'high',
  },
  {
    id: 'ia-r2',
    fieldId: 'f12',
    type: 'risk',
    title: 'Suelo degradado: enmienda urgente',
    description: 'Indicadores de compactación y pH ácido (5.3). Requiere enmienda calcárea antes de la próxima siembra.',
    confidence: 88,
    impact: 'high',
  },
  {
    id: 'ia-r3',
    fieldId: 'f3',
    type: 'warning',
    title: 'Rendimiento bajo el potencial',
    description: 'Producción proyectada 12% por debajo del potencial genético de la variedad para esta zona.',
    confidence: 79,
    impact: 'medium',
  },
  {
    id: 'ia-r4',
    fieldId: 'f1',
    type: 'opportunity',
    title: 'Potencial de réplica de manejo',
    description: 'El Lote 4 supera el promedio del campo en 18%. Evaluar replicar estrategia en lotes equivalentes.',
    confidence: 85,
    impact: 'medium',
  },
  {
    id: 'ia-r5',
    fieldId: 'f6',
    type: 'insight',
    title: 'Ventana óptima de cosecha',
    description: 'Los niveles de sacarosa alcanzan el pico. La cosecha de los próximos 7 días maximizará el rendimiento azucarero.',
    confidence: 91,
    impact: 'high',
  },
];

export const PRODUCTION_STOPS = [
  { t: 0, color: '#EF4444' },
  { t: 0.25, color: '#F97316' },
  { t: 0.5, color: '#FACC15' },
  { t: 0.75, color: '#4ADE80' },
  { t: 1, color: '#15803D' },
];

export const COST_STOPS = [
  { t: 0, color: '#3B82F6' },
  { t: 0.5, color: '#8B5CF6' },
  { t: 1, color: '#EC4899' },
];

export const WEATHER_CODE_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  clear: { label: 'Despejado', color: '#FACC15' },
  'partly-cloudy': { label: 'Parcialmente nublado', color: '#94A3B8' },
  cloudy: { label: 'Nublado', color: '#64748B' },
  rain: { label: 'Lluvia', color: '#3B82F6' },
  storm: { label: 'Tormenta', color: '#7C3AED' },
};
