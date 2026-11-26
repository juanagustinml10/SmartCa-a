'use client';

import { Settings, User, Bell, Sun, Shield, Building2, Link, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSidebarProps {
  tabs: { id: string; label: string; icon: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Settings, User, Bell, Sun, Shield, Building2, Link,
};

export function SettingsSidebar({ tabs, activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <div className="w-56 shrink-0 border-r border-border-default bg-bg-surface p-4 hidden md:block">
      <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4 px-2">Configuración</h2>
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon] ?? Settings;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-xs font-medium transition-colors text-left',
                isActive ? 'bg-brand-500/10 text-brand-500' : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle',
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
