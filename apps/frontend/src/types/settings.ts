export type ThemeMode = 'light' | 'dark' | 'auto';

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  fieldAlerts: boolean;
  weatherAlerts: boolean;
  costAlerts: boolean;
  harvestAlerts: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  activeSessions: SessionInfo[];
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface CompanyInfo {
  name: string;
  cuit: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  fieldsCount: number;
  totalHectares: number;
  activeCampaign: string;
}

export interface SettingsTab {
  id: string;
  label: string;
  icon: string;
}
