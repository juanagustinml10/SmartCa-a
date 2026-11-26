import type { ActivityItem, ActivityTypeCode } from '@/types/activities';

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function time(h: number, m = 0): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

const FIELDS = [
  { id: 'f1', name: 'El Talita', farm: 'Establecimiento Principal' },
  { id: 'f2', name: 'Los Crespo', farm: 'Establecimiento Principal' },
  { id: 'f3', name: 'La Merced', farm: 'Establecimiento Principal' },
  { id: 'f4', name: 'San Antonio', farm: 'Establecimiento Principal' },
  { id: 'f5', name: 'El Ochenta', farm: 'Establecimiento Principal' },
  { id: 'f6', name: 'La Loma', farm: 'Establecimiento Principal' },
  { id: 'f7', name: 'San José', farm: 'Establecimiento Principal' },
  { id: 'f8', name: 'Santa Rosa', farm: 'Establecimiento Principal' },
  { id: 'f9', name: 'El Puesto', farm: 'Establecimiento Principal' },
  { id: 'f10', name: 'La Esperanza', farm: 'Establecimiento Principal' },
];

const RESPONSIBLES = [
  'Carlos Mendoza', 'María López', 'José Fernández', 'Ana Romero',
  'Pedro Sánchez', 'Laura Torres', 'Gabriel Rivas', 'Sofía Paz',
];

const MACHINERY = [
  ['Tractor John Deere 6155J'],
  ['Tractor Case IH Puma 185', 'Cosechadora John Deere S780'],
  ['Pulverizador Jacto Uniport 2000'],
  ['Sembradora Crucianelli'],
  ['Tractor Massey Ferguson 7720', 'Riego pivote central'],
  ['Cosechadora Case IH 7240'],
  ['Tractor New Holland T7.220', 'Fertilizadora'],
  [],
];

const WEATHER_CONDITIONS = [
  { temperature: 28, humidity: 65, conditions: 'Despejado', windSpeed: 12 },
  { temperature: 32, humidity: 55, conditions: 'Parcialmente nublado', windSpeed: 8 },
  { temperature: 25, humidity: 78, conditions: 'Nublado', windSpeed: 15 },
  { temperature: 30, humidity: 60, conditions: 'Despejado', windSpeed: 10 },
  { temperature: 22, humidity: 85, conditions: 'Lluvia ligera', windSpeed: 20 },
  { temperature: 35, humidity: 45, conditions: 'Despejado', windSpeed: 5 },
];

const TITLES: Record<string, string[]> = {
  planting: ['Plantación de caña', 'Resiembra Lote {field}', 'Siembra mecanizada'],
  irrigation: ['Riego programado', 'Riego por gravedad', 'Riego complementario', 'Riego de emergencia'],
  fertilization: ['Fertilización nitrogenada', 'Fertilización potásica', 'Aplicación de fósforo', 'Fertilización foliar'],
  fumigation: ['Fumigación preventiva', 'Control de plagas', 'Aplicación de insecticida'],
  weed_control: ['Control de malezas', 'Aplicación de herbicida', 'Desmalezado mecánico'],
  soil_analysis: ['Muestreo de suelo', 'Análisis de nutrientes', 'Extracción de muestras'],
  maintenance: ['Mantenimiento de equipos', 'Limpieza de canales', 'Reparación de alambrados'],
  harvest: ['Cosecha mecanizada', 'Cosecha manual', 'Inicio de cosecha'],
  inspection: ['Inspección de cultivo', 'Recorrida de campo', 'Evaluación sanitaria'],
  monitoring: ['Monitoreo de plagas', 'Monitoreo de humedad', 'Monitoreo NDVI'],
  foliar_application: ['Aplicación foliar', 'Fertilización foliar complementaria'],
  other: ['Tarea administrativa', 'Coordinación logística', 'Capacitación'],
};

let counter = 0;

function generateActivity(
  type: ActivityTypeCode,
  days: number,
  h: number,
  m: number,
  status: ActivityItem['status'] = 'completed',
  priority: ActivityItem['priority'] = 'medium',
): ActivityItem {
  counter++;
  const field = FIELDS[counter % FIELDS.length];
  const fieldIdx = FIELDS.indexOf(field);
  const titles = TITLES[type];
  const title = titles[counter % titles.length].replace('{field}', field.name);
  const responsible = RESPONSIBLES[counter % RESPONSIBLES.length];
  const weather = WEATHER_CONDITIONS[counter % WEATHER_CONDITIONS.length];
  const machinery = MACHINERY[fieldIdx % MACHINERY.length];
  const date = daysAgo(days);
  const duration = 30 + Math.floor(Math.random() * 210);

  const baseCost = {
    planting: 45000, irrigation: 12000, fertilization: 28000, fumigation: 22000,
    weed_control: 18000, soil_analysis: 8000, maintenance: 15000, harvest: 55000,
    inspection: 5000, monitoring: 6000, foliar_application: 25000, other: 10000,
  };

  return {
    id: `act-${type}-${counter}`,
    type,
    title,
    description: `${title} en ${field.name} - ${field.farm}`,
    fieldId: field.id,
    fieldName: field.name,
    farmName: field.farm,
    campaign: '2025/2026',
    date,
    startTime: time(h, m),
    endTime: time(h + Math.floor(duration / 60), m + (duration % 60)),
    duration,
    responsible,
    status,
    priority,
    estimatedCost: baseCost[type as keyof typeof baseCost] * (0.8 + Math.random() * 0.4),
    actualCost: status === 'completed' ? baseCost[type as keyof typeof baseCost] * (0.75 + Math.random() * 0.5) : null,
    productName: ['fertilization', 'fumigation', 'weed_control', 'foliar_application'].includes(type)
      ? ['Urea 46%', 'Fosfato monoamónico', 'Glifosato', '2,4-D', 'Atrazina'][counter % 5]
      : undefined,
    doseAmount: Math.random() > 0.5 ? 2 + Math.random() * 8 : undefined,
    doseUnit: 'L/ha',
    machinery: machinery.length > 0 ? machinery : undefined,
    weather,
    location: { lat: -26.83 + Math.random() * 0.06, lng: -65.22 + Math.random() * 0.04 },
    attachments: [],
    observations: '',
    createdAt: date,
    updatedAt: date,
  };
}

const TYPES: ActivityTypeCode[] = [
  'planting', 'irrigation', 'fertilization', 'fumigation', 'weed_control',
  'soil_analysis', 'maintenance', 'harvest', 'inspection', 'monitoring',
  'foliar_application', 'other',
];

export function generateMockActivities(count = 120): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const usedDates = new Set<string>();

  for (let i = 0; i < count; i++) {
    const type = TYPES[i % TYPES.length];
    const days = Math.floor(i / 8);
    const hour = 6 + (i % 10);
    const minute = (i * 7) % 60;

    const statuses: ActivityItem['status'][] = ['completed', 'completed', 'completed', 'in_progress', 'pending', 'completed', 'cancelled', 'completed'];
    const priorities: ActivityItem['priority'][] = ['medium', 'low', 'high', 'medium', 'critical', 'medium', 'low', 'high'];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];

    const date = daysAgo(days);
    const dateKey = date.slice(0, 10);

    if (!usedDates.has(dateKey) || Math.random() > 0.3) {
      usedDates.add(dateKey);
      activities.push(generateActivity(type, days, hour, minute, status, priority));
    }
  }

  return activities;
}

export const MOCK_ACTIVITIES = generateMockActivities(120);
