export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type ActivityPriority = 'low' | 'medium' | 'high' | 'critical';

export type ActivityTypeCode =
  | 'planting'
  | 'irrigation'
  | 'fertilization'
  | 'fumigation'
  | 'weed_control'
  | 'soil_analysis'
  | 'maintenance'
  | 'harvest'
  | 'inspection'
  | 'monitoring'
  | 'foliar_application'
  | 'other';

export interface ActivityType {
  code: ActivityTypeCode;
  name: string;
  icon: string;
  color: string;
  bg: string;
  requiresProduct: boolean;
  requiresDose: boolean;
  requiresCost: boolean;
}

export interface ActivityAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'excel' | 'video';
  size: number;
  url: string;
}

export interface ActivityWeather {
  temperature: number;
  humidity: number;
  conditions: string;
  windSpeed: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityTypeCode;
  title: string;
  description: string;
  fieldId: string;
  fieldName: string;
  farmName: string;
  campaign: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  responsible: string;
  responsibleAvatar?: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  estimatedCost: number;
  actualCost: number | null;
  productName?: string;
  doseAmount?: number;
  doseUnit?: string;
  machinery?: string[];
  weather?: ActivityWeather;
  location?: { lat: number; lng: number };
  attachments: ActivityAttachment[];
  observations: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityView = 'timeline' | 'calendar' | 'table';

export interface ActivityFiltersState {
  search: string;
  types: ActivityTypeCode[];
  status: ActivityStatus[];
  priority: ActivityPriority[];
  campaign: string;
  fieldId: string;
  farmName: string;
  dateRange: [string, string];
  responsible: string;
}

export const ACTIVITY_TYPE_CONFIG: Record<ActivityTypeCode, ActivityType> = {
  planting: { code: 'planting', name: 'Plantación', icon: 'Sprout', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950/20', requiresProduct: true, requiresDose: false, requiresCost: true },
  irrigation: { code: 'irrigation', name: 'Riego', icon: 'Droplets', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', requiresProduct: false, requiresDose: false, requiresCost: true },
  fertilization: { code: 'fertilization', name: 'Fertilización', icon: 'FlaskConical', color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950/20', requiresProduct: true, requiresDose: true, requiresCost: true },
  fumigation: { code: 'fumigation', name: 'Fumigación', icon: 'SprayCan', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', requiresProduct: true, requiresDose: true, requiresCost: true },
  weed_control: { code: 'weed_control', name: 'Control de malezas', icon: 'Shield', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20', requiresProduct: true, requiresDose: true, requiresCost: true },
  soil_analysis: { code: 'soil_analysis', name: 'Análisis de suelo', icon: 'Cylinder', color: 'text-stone-500', bg: 'bg-stone-50 dark:bg-stone-950/20', requiresProduct: false, requiresDose: false, requiresCost: true },
  maintenance: { code: 'maintenance', name: 'Mantenimiento', icon: 'Wrench', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-950/20', requiresProduct: false, requiresDose: false, requiresCost: true },
  harvest: { code: 'harvest', name: 'Cosecha', icon: 'Combine', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', requiresProduct: false, requiresDose: false, requiresCost: true },
  inspection: { code: 'inspection', name: 'Inspección', icon: 'ClipboardCheck', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', requiresProduct: false, requiresDose: false, requiresCost: false },
  monitoring: { code: 'monitoring', name: 'Monitoreo', icon: 'Radar', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20', requiresProduct: false, requiresDose: false, requiresCost: false },
  foliar_application: { code: 'foliar_application', name: 'Aplicación foliar', icon: 'Leaf', color: 'text-lime-500', bg: 'bg-lime-50 dark:bg-lime-950/20', requiresProduct: true, requiresDose: true, requiresCost: true },
  other: { code: 'other', name: 'Otro', icon: 'ClipboardList', color: 'text-text-secondary', bg: 'bg-bg-subtle', requiresProduct: false, requiresDose: false, requiresCost: false },
};

export const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'Pendiente', color: 'text-text-secondary', bg: 'bg-bg-subtle', dot: 'bg-text-tertiary' },
  in_progress: { label: 'En curso', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', dot: 'bg-blue-500' },
  completed: { label: 'Completada', color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-950/20', dot: 'bg-success-500' },
  cancelled: { label: 'Cancelada', color: 'text-error-500', bg: 'bg-error-50 dark:bg-error-950/20', dot: 'bg-error-500' },
};

export const PRIORITY_CONFIG: Record<ActivityPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Baja', color: 'text-text-tertiary', bg: 'bg-bg-subtle' },
  medium: { label: 'Media', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  high: { label: 'Alta', color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-950/20' },
  critical: { label: 'Crítica', color: 'text-error-500', bg: 'bg-error-50 dark:bg-error-950/20' },
};
