export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginatedMeta;
}

export type RoleCode = 'super_admin' | 'admin' | 'gerente' | 'supervisor' | 'ingeniero' | 'operador' | 'invitado';

export type CompanyStatus = 'active' | 'inactive' | 'suspended';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export type FarmStatus = 'active' | 'inactive';

export type FieldStatus = 'active' | 'inactive' | 'harvesting' | 'resting';

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleCode;
  companyId: string;
  /** ID de la sesión persistida que originó este access token. */
  sessionId: string;
  permissions?: string[];
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
  sessionId: string;
}

export type PermissionCode =
  | 'dashboard.view'
  | 'fields.view'
  | 'fields.create'
  | 'fields.edit'
  | 'fields.delete'
  | 'activities.view'
  | 'activities.create'
  | 'activities.edit'
  | 'activities.delete'
  | 'production.view'
  | 'production.edit'
  | 'costs.view'
  | 'costs.create'
  | 'costs.edit'
  | 'costs.delete'
  | 'costs.export'
  | 'harvests.view'
  | 'harvests.create'
  | 'harvests.edit'
  | 'shi.view'
  | 'ia.use'
  | 'reports.view'
  | 'reports.export'
  | 'executive.view'
  | 'map.view'
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'roles.view'
  | 'roles.manage'
  | 'permissions.manage'
  | 'companies.view'
  | 'companies.manage'
  | 'sessions.view'
  | 'sessions.revoke'
  | 'audit.view'
  | 'audit.export'
  | 'settings.view'
  | 'settings.manage'
  | 'suppliers.view'
  | 'suppliers.create'
  | 'suppliers.edit'
  | 'suppliers.delete';

export interface SessionInfo {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  companyId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

/* ── Dashboard: datos calculados en PostgreSQL ── */

export interface DashboardCampaign {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface DashboardFilters {
  from: string | null;
  to: string | null;
  campaignId: string | null;
}

export interface DashboardMetrics {
  farms: number;
  fields: number;
  areaHectares: number;
  activities: number;
  costsTotal: number;
  harvests: number;
  productionTons: number;
  activeAlerts: number;
  averageShi: number | null;
  costPerHectare: number | null;
}

export interface DashboardTrend {
  percent: number | null;
  previous: number;
}

export interface DashboardTrends {
  activities: DashboardTrend | null;
  costsTotal: DashboardTrend | null;
  productionTons: DashboardTrend | null;
  activeAlerts: DashboardTrend | null;
}

export interface DashboardFieldStatus {
  code: string;
  name: string;
  count: number;
  areaHectares: number;
}

export interface DashboardCostCategory {
  id: string;
  name: string;
  color: string;
  total: number;
}

export interface DashboardCostPoint {
  month: string;
  total: number;
}

export interface DashboardProductionPoint {
  campaignCode: string;
  campaignName: string;
  production: number;
  yieldPerHectare: number;
  target: number;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
  field: string | null;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  field: string | null;
}

export interface DashboardField {
  id: string;
  name: string;
  farmName: string;
  areaHectares: number;
  statusCode: string;
  statusName: string;
  healthScore: number | null;
  shiScore: number | null;
  shiLevel: string | null;
  color: string | null;
}

export interface DashboardOverview {
  filters: DashboardFilters;
  campaigns: DashboardCampaign[];
  metrics: DashboardMetrics;
  trends: DashboardTrends;
  fieldStatus: DashboardFieldStatus[];
  costByCategory: DashboardCostCategory[];
  costByMonth: DashboardCostPoint[];
  productionByCampaign: DashboardProductionPoint[];
  alerts: DashboardAlert[];
  activities: DashboardActivity[];
  fields: DashboardField[];
}
