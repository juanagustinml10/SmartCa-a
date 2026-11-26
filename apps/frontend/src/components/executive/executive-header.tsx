'use client';

import { useState, useEffect, useCallback } from 'react';
import { Monitor, Filter, Maximize2, Minimize2, Bell, Settings, Download, Circle } from 'lucide-react';
import { useExecutive } from '@/contexts/executive-context';
import { MOCK_CONNECTION_STATUS, MOCK_NOTIFICATIONS } from '@/lib/mock-executive';

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

export function ExecutiveHeader() {
  const { layout, setFullscreen, toggleFilters, setSettingsOpen, setExportOpen } = useExecutive();
  const time = useClock();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications] = useState(MOCK_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.read).length;
  const connStatus = MOCK_CONNECTION_STATUS;
  const allConnected = Object.values(connStatus).every((s) => s === 'connected');

  const formatTime = useCallback((d: Date) => {
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, []);

  const formatDate = useCallback((d: Date) => {
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-default bg-bg-surface px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
          <Monitor className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary leading-tight">Centro de Comando</h1>
          <p className="text-[10px] text-text-tertiary leading-tight">Executive Command Center</p>
        </div>
        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-border-default">
          <span className="text-xs font-mono text-text-primary font-medium">{formatTime(time)}</span>
          <span className="text-[10px] text-text-tertiary">|</span>
          <span className="text-[10px] text-text-tertiary">{formatDate(time)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          <Circle className={`h-2 w-2 ${allConnected ? 'text-success-500' : 'text-warning-500'}`} fill="currentColor" />
          <span className="text-[10px] text-text-tertiary">
            {allConnected ? 'Todos los sistemas operativos' : 'Verificar conexiones'}
          </span>
        </div>

        <button
          onClick={toggleFilters}
          className={`flex items-center gap-1.5 rounded-lg px-3 h-8 text-xs font-medium transition-colors ${
            layout.filtersVisible
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20'
              : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filtros</span>
        </button>

        <button
          onClick={() => setExportOpen(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 h-8 text-xs font-medium text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
          title="Exportar dashboard"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="flex items-center justify-center rounded-lg h-8 w-8 text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors relative"
            title="Notificaciones"
          >
            <Bell className="h-3.5 w-3.5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-error-500 text-[9px] font-bold text-white px-1">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-border-default bg-bg-surface shadow-lg z-50">
              <div className="px-3 py-2 border-b border-border-default">
                <p className="text-xs font-semibold text-text-primary">Notificaciones</p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-2 px-3 py-2 border-b border-border-default last:border-0 ${!n.read ? 'bg-brand-50/30 dark:bg-brand-950/10' : ''}`}>
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      n.type === 'success' ? 'bg-success-500' :
                      n.type === 'warning' ? 'bg-warning-500' : 'bg-info-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-primary">{n.title}</p>
                      <p className="text-[10px] text-text-tertiary">{new Date(n.timestamp).toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center justify-center rounded-lg h-8 w-8 text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
          title="Configuración de widgets"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => setFullscreen(!layout.fullscreen)}
          className="flex items-center justify-center rounded-lg h-8 w-8 text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors"
          title={layout.fullscreen ? 'Salir de pantalla completa' : 'Modo Centro de Control'}
        >
          {layout.fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </header>
  );
}
