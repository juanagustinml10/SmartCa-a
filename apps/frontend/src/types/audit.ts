export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'error'
  | 'token_refresh';

export type AuditEntity =
  | 'User'
  | 'Company'
  | 'Field'
  | 'Cost'
  | 'Harvest'
  | 'Activity'
  | 'Role'
  | 'Session'
  | 'Permission';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  description: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  device: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActiveAt: string;
  isCurrent: boolean;
  createdAt: string;
}
