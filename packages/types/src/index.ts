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
  permissions?: string[];
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
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
