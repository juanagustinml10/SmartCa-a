'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Monitor, Sprout, Map, ClipboardList, BarChart3,
  DollarSign, Bot, Settings, ChevronLeft, Shield, MonitorCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'executive', label: 'Comando', icon: Monitor, href: '/executive' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'fields', label: 'Campos', icon: Sprout, href: '/campos' },
  { id: 'map', label: 'Mapa', icon: Map, href: '/mapa' },
  { id: 'activities', label: 'Actividades', icon: ClipboardList, href: '/actividades' },
  { id: 'production', label: 'Producción', icon: BarChart3, href: '/produccion' },
  { id: 'costs', label: 'Costos', icon: DollarSign, href: '/costos' },
  { id: 'ai', label: 'IA', icon: Bot, href: '/ia' },
  { id: 'audit', label: 'Auditoría', icon: Shield, href: '/audit' },
  { id: 'sessions', label: 'Sesiones', icon: MonitorCheck, href: '/sessions' },
  { id: 'settings', label: 'Config', icon: Settings, href: '/settings' },
];

interface CompactSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function CompactSidebar({ collapsed, onToggle }: CompactSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="flex flex-col border-r border-border-default bg-bg-surface shrink-0 transition-all duration-200" style={{ width: collapsed ? 52 : 52 }}>
      <div className="flex h-14 items-center justify-center border-b border-border-default">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
          <Monitor className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              title={item.label}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-500'
                  : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border-default p-2 flex justify-center">
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
          title="Colapsar"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
