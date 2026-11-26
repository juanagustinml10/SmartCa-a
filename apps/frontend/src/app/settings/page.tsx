'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { SettingsGeneral } from '@/components/settings/settings-general';
import { SettingsAccount } from '@/components/settings/settings-account';
import { SettingsNotifications } from '@/components/settings/settings-notifications';
import { SettingsTheme } from '@/components/settings/settings-theme';
import { SettingsSecurity } from '@/components/settings/settings-security';
import { SettingsCompany } from '@/components/settings/settings-company';
import { SettingsIntegrations } from '@/components/settings/settings-integrations';
import { SettingsSidebar } from '@/components/settings/settings-sidebar';

const TABS = [
  { id: 'general', label: 'General', icon: 'Settings' },
  { id: 'account', label: 'Cuenta', icon: 'User' },
  { id: 'notifications', label: 'Notificaciones', icon: 'Bell' },
  { id: 'theme', label: 'Tema', icon: 'Sun' },
  { id: 'security', label: 'Seguridad', icon: 'Shield' },
  { id: 'company', label: 'Empresa', icon: 'Building2' },
  { id: 'integrations', label: 'Integraciones', icon: 'Link' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <SettingsGeneral />;
      case 'account': return <SettingsAccount />;
      case 'notifications': return <SettingsNotifications />;
      case 'theme': return <SettingsTheme />;
      case 'security': return <SettingsSecurity />;
      case 'company': return <SettingsCompany />;
      case 'integrations': return <SettingsIntegrations />;
      default: return <SettingsGeneral />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={sidebarMobile} onMobileClose={() => setSidebarMobile(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarMobile(true)} />
        <div className="flex-1 flex overflow-hidden">
          <SettingsSidebar tabs={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabId)} />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
