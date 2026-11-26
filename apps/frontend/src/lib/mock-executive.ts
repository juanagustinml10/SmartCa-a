import type { ExecutiveKpi, TimelineEvent, IARecommendation, IASummary, ConnectionStatus } from '@/types/executive';
import { MOCK_FIELDS } from './mock-fields';
import { MOCK_HARVEST_ANALYTICS, MOCK_FIELD_SHI } from './mock-harvests';
import { MOCK_COST_ANALYTICS, MOCK_COST_ALERTS } from './mock-costs';
import { MOCK_ACTIVITIES } from './mock-activities';
import { MOCK_ALERTS } from './mock-data';

export const MOCK_EXECUTIVE_KPIS: ExecutiveKpi[] = [
  {
    id: 'production',
    label: 'Producción Total',
    value: MOCK_HARVEST_ANALYTICS.totalTons,
    unit: 't',
    trend: 'up',
    trendValue: '+12.3%',
    icon: 'Truck',
    color: 'brand',
    decimals: 0,
    tooltip: 'Total de caña cosechada en la campaña actual. Incluye todos los lotes activos.',
    category: 'production',
  },
  {
    id: 'projected',
    label: 'Producción Proyectada',
    value: 16800,
    unit: 't',
    trend: 'up',
    trendValue: '+8.7%',
    icon: 'TrendingUp',
    color: 'accent',
    decimals: 0,
    tooltip: 'Proyección basada en rendimiento actual y superficie restante por cosechar.',
    category: 'production',
  },
  {
    id: 'cost_total',
    label: 'Costo Total',
    value: MOCK_COST_ANALYTICS.totalAmount,
    unit: '$',
    trend: 'up',
    trendValue: '+3.2%',
    icon: 'Wallet',
    color: 'warning',
    decimals: 0,
    tooltip: 'Costo acumulado de todas las actividades, insumos y servicios de la campaña.',
    category: 'cost',
  },
  {
    id: 'cost_ha',
    label: 'Costo por Hectárea',
    value: Math.round(MOCK_COST_ANALYTICS.costPerHectare),
    unit: '$/ha',
    trend: 'up',
    trendValue: '+1.8%',
    icon: 'DollarSign',
    color: 'warning',
    decimals: 0,
    tooltip: 'Costo promedio por hectárea cultivada. Calculado sobre superficie total activa.',
    category: 'cost',
  },
  {
    id: 'profitability',
    label: 'Rentabilidad',
    value: 28.5,
    unit: '%',
    trend: 'up',
    trendValue: '+2.1 pp',
    icon: 'TrendingUp',
    color: 'brand',
    decimals: 1,
    tooltip: 'Margen de rentabilidad estimado sobre costos totales vs. ingresos proyectados.',
    category: 'production',
  },
  {
    id: 'shi_avg',
    label: 'SHI Promedio',
    value: Math.round([...MOCK_FIELD_SHI.values()].reduce((a, r) => a + r.score, 0) / MOCK_FIELD_SHI.size),
    unit: '/100',
    trend: 'up',
    trendValue: '+5 pts',
    icon: 'Gauge',
    color: 'info',
    decimals: 0,
    tooltip: 'Smart Health Index promedio de todos los lotes. Indicador compuesto de salud del cultivo.',
    category: 'shi',
  },
  {
    id: 'alerts',
    label: 'Alertas Activas',
    value: MOCK_ALERTS.length + MOCK_COST_ALERTS.length,
    unit: '',
    trend: 'down',
    trendValue: '-2 vs ayer',
    icon: 'Bell',
    color: 'error',
    decimals: 0,
    tooltip: 'Alertas críticas y de alto riesgo que requieren atención inmediata.',
    category: 'alerts',
  },
  {
    id: 'pending',
    label: 'Actividades Pendientes',
    value: MOCK_ACTIVITIES.filter((a) => a.status === 'pending').length,
    unit: '',
    trend: 'neutral',
    trendValue: 'Sin cambios',
    icon: 'Clock',
    color: 'warning',
    decimals: 0,
    tooltip: 'Actividades programadas pendientes de ejecución en los próximos 7 días.',
    category: 'alerts',
  },
  {
    id: 'ia_risk',
    label: 'Riesgo IA',
    value: 23,
    unit: '%',
    trend: 'down',
    trendValue: '-5 %',
    icon: 'Bot',
    color: 'info',
    decimals: 0,
    tooltip: 'Índice de riesgo calculado por IA basado en clima, plagas, y estrés hídrico.',
    category: 'ia',
  },
  {
    id: 'climate',
    label: 'Temperatura Actual',
    value: 32,
    unit: '°C',
    trend: 'up',
    trendValue: '+3°C',
    icon: 'Sun',
    color: 'accent',
    decimals: 0,
    tooltip: 'Temperatura actual en la estación meteorológica principal. Máxima esperada: 35°C.',
    category: 'climate',
  },
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  ...MOCK_ACTIVITIES.slice(0, 20).map((a) => ({
    id: `timeline-${a.id}`,
    type: 'activity' as const,
    title: a.title,
    description: a.description || `${a.type} programada`,
    timestamp: a.date,
    fieldId: a.fieldId,
    fieldName: a.fieldName,
    severity: a.priority === 'critical' ? ('critical' as const) : a.priority === 'high' ? ('high' as const) : 'medium' as const,
  })),
  ...MOCK_COST_ALERTS.slice(0, 5).map((a) => ({
    id: `timeline-cost-${a.id}`,
    type: 'alert' as const,
    title: a.title,
    description: a.description,
    timestamp: a.timestamp,
    severity: a.severity === 'critical' ? ('critical' as const) : a.severity === 'high' ? ('high' as const) : 'medium' as const,
    amount: a.amount,
  })),
  ...MOCK_ALERTS.map((a) => ({
    id: `timeline-alert-${a.id}`,
    type: 'alert' as const,
    title: a.title,
    description: a.description,
    timestamp: a.timestamp,
    severity: a.priority === 'critical' ? ('critical' as const) : a.priority === 'high' ? ('high' as const) : 'medium' as const,
  })),
];

export const MOCK_IA_RECOMMENDATIONS: IARecommendation[] = [
  {
    id: 'ia-1',
    type: 'risk',
    title: 'Riesgo de heladas tempranas',
    description: 'Modelos climáticos indican probabilidad del 65% de heladas en los próximos 10 días. Considere adelantar cosecha en lotes de menor altitud.',
    confidence: 78,
    impact: 'high',
    timestamp: '2026-07-29T06:00:00',
  },
  {
    id: 'ia-2',
    type: 'opportunity',
    title: 'Ventana óptima de fertilización',
    description: 'Las condiciones de humedad y temperatura serán ideales para fertilización nitrogenada entre el 31/7 y 2/8.',
    confidence: 85,
    impact: 'medium',
    timestamp: '2026-07-29T06:00:00',
  },
  {
    id: 'ia-3',
    type: 'insight',
    title: 'Rendimiento superior en Lote 4',
    description: 'El Lote 4 supera en 18% el rendimiento promedio del campo. El análisis sugiere que el manejo de riego diferenciado fue determinante.',
    confidence: 92,
    impact: 'high',
    timestamp: '2026-07-28T14:00:00',
  },
  {
    id: 'ia-4',
    type: 'warning',
    title: 'Incremento en costos de transporte',
    description: 'Los costos logísticos aumentaron 12% en las últimas dos semanas. Evaluar rutas alternativas o negociar tarifas.',
    confidence: 88,
    impact: 'medium',
    timestamp: '2026-07-28T08:00:00',
  },
  {
    id: 'ia-5',
    type: 'insight',
    title: 'Predicción de producción',
    description: 'Se estima una producción final de 16.800 t con un rendimiento promedio de 73.2 t/ha, superando la meta en 4.6%.',
    confidence: 82,
    impact: 'high',
    timestamp: '2026-07-28T06:00:00',
  },
];

export const MOCK_CHART_PRODUCTION = [
  { campaign: '2021/22', production: 10200, yield_: 58.2, target: 65, cost: 520000 },
  { campaign: '2022/23', production: 11050, yield_: 62.1, target: 65, cost: 580000 },
  { campaign: '2023/24', production: 9800, yield_: 55.8, target: 68, cost: 610000 },
  { campaign: '2024/25', production: 11900, yield_: 67.4, target: 70, cost: 745000 },
  { campaign: '2025/26', production: 12458, yield_: 72.3, target: 70, cost: 845200 },
];

export const MOCK_CHART_SHI_DIMENSIONS = [
  { dimension: 'Sanidad', value: 85 },
  { dimension: 'Estado', value: 78 },
  { dimension: 'Alertas', value: 65 },
  { dimension: 'Actividades', value: 72 },
  { dimension: 'Producción', value: 88 },
  { dimension: 'Costos', value: 70 },
  { dimension: 'Suelo', value: 76 },
];

export const MOCK_CHART_COST_BY_CATEGORY = [
  { category: 'Labores', amount: 320000, fill: '#1DB85E' },
  { category: 'Insumos', amount: 245000, fill: '#3B82F6' },
  { category: 'Cosecha', amount: 180000, fill: '#F59A00' },
  { category: 'Transporte', amount: 65200, fill: '#8B5CF6' },
  { category: 'Otros', amount: 35000, fill: '#06B6D4' },
];

export const MOCK_CHART_MONTHLY_PRODUCTION = [
  { month: 'Ene', production: 0, cost: 0 },
  { month: 'Feb', production: 0, cost: 12000 },
  { month: 'Mar', production: 0, cost: 45000 },
  { month: 'Abr', production: 0, cost: 82000 },
  { month: 'May', production: 2400, cost: 156000 },
  { month: 'Jun', production: 5800, cost: 198000 },
  { month: 'Jul', production: 4258, cost: 215000 },
  { month: 'Ago', production: 0, cost: 87200 },
  { month: 'Sep', production: 0, cost: 32000 },
  { month: 'Oct', production: 0, cost: 11000 },
  { month: 'Nov', production: 0, cost: 5000 },
  { month: 'Dic', production: 0, cost: 2000 },
];

export const MOCK_IA_SUMMARY: IASummary = {
  dailySummary: 'Condiciones generales estables. Se recomienda monitorear lotes del sector norte por posible estrés hídrico. La cosecha avanza según lo planificado con rendimientos dentro del rango esperado.',
  mainRecommendation: 'Iniciar aplicación preventiva de fungicida en Lotes 3 y 7 debido a alta humedad ambiental pronosticada para los próximos 5 días.',
  riskLevel: 'moderate',
  productionPrediction: { value: 16800, unit: 't', confidence: 82 },
  financialPrediction: { value: 2350000, unit: '$', confidence: 76 },
  smartAlerts: 4,
  lastUpdated: '2026-07-29T06:00:00',
};

export const MOCK_CONNECTION_STATUS: ConnectionStatus = {
  database: 'connected',
  api: 'connected',
  gis: 'connected',
  ia: 'connected',
};

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'Cosecha completada en Lote 2', type: 'success', timestamp: '2026-07-29T08:30:00', read: false },
  { id: 'n2', title: 'Alerta de heladas en sector sur', type: 'warning', timestamp: '2026-07-29T06:00:00', read: false },
  { id: 'n3', title: 'Nuevo reporte de costos disponible', type: 'info', timestamp: '2026-07-28T18:00:00', read: true },
  { id: 'n4', title: 'Predicción IA actualizada', type: 'info', timestamp: '2026-07-28T06:00:00', read: true },
];

export const MOCK_FILTER_OPTIONS = {
  companies: [
    { value: 'c1', label: 'Ingenio La Florida S.A.' },
    { value: 'c2', label: 'Cooperativa Cañera Sur' },
  ],
  farms: [
    { value: 'f1', label: 'Establecimiento El Rosario' },
    { value: 'f2', label: 'Establecimiento San Antonio' },
    { value: 'f3', label: 'Establecimiento La Merced' },
  ],
  fields: MOCK_FIELDS.map((f) => ({ value: f.id, label: f.name })),
  suppliers: [
    { value: 's1', label: 'AgroInsumos S.A.' },
    { value: 's2', label: 'Semillas del Norte' },
    { value: 's3', label: 'Transporte Rural SRL' },
  ],
  campaigns: [
    { value: '2025-2026', label: '2025/2026' },
    { value: '2024-2025', label: '2024/2025' },
    { value: '2023-2024', label: '2023/2024' },
  ],
  statuses: [
    { value: 'active', label: 'Activo' },
    { value: 'harvesting', label: 'En cosecha' },
    { value: 'resting', label: 'En descanso' },
    { value: 'inactive', label: 'Inactivo' },
  ],
  categories: [
    { value: 'production', label: 'Producción' },
    { value: 'cost', label: 'Costos' },
    { value: 'shi', label: 'SHI' },
    { value: 'alerts', label: 'Alertas' },
    { value: 'ia', label: 'IA' },
    { value: 'climate', label: 'Clima' },
  ],
};

export const MOCK_FIELD_DETAIL = MOCK_FIELDS.map((f) => {
  const shi = MOCK_FIELD_SHI.get(f.id);
  return {
    id: f.id,
    name: f.name,
    alias: f.alias,
    surfaceHa: f.surfaceHa,
    status: f.status,
    variety: f.variety,
    campaign: f.campaign,
    healthScore: f.healthScore,
    shiScore: shi?.score ?? 0,
    shiLevel: shi?.level ?? 'regular',
    estimatedProduction: f.estimatedProduction,
    location: f.location,
    alerts: f.alerts?.length ?? 0,
  };
});
