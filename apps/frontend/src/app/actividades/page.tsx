'use client';

import { useState, useMemo, useCallback } from 'react';
import { Timeline, Calendar, Table2, Plus, FileText } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_ACTIVITIES } from '@/lib/mock-activities';
import type { ActivityView, ActivityFiltersState } from '@/types/activities';
import ActivityTimeline from '@/components/activities/activity-timeline';
import ActivityCalendar from '@/components/activities/activity-calendar';
import ActivityTable from '@/components/activities/activity-table';
import ActivityFilters from '@/components/activities/activity-filters';
import ActivitySidebar from '@/components/activities/activity-sidebar';

const VIEWS: { id: ActivityView; label: string; icon: typeof Timeline }[] = [
  { id: 'timeline', label: 'Timeline', icon: Timeline },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'table', label: 'Tabla', icon: Table2 },
];

export default function ActividadesPage() {
  const [view, setView] = useState<ActivityView>('timeline');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFiltersState>({
    search: '', types: [], status: [], priority: [], campaign: '',
    fieldId: '', farmName: '', dateRange: ['', ''], responsible: '',
  });

  const filtered = useMemo(() => {
    return MOCK_ACTIVITIES.filter((act) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!act.title.toLowerCase().includes(q) && !act.fieldName.toLowerCase().includes(q) && !act.responsible.toLowerCase().includes(q)) return false;
      }
      if (filters.types.length > 0 && !filters.types.includes(act.type)) return false;
      if (filters.status.length > 0 && !filters.status.includes(act.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(act.priority)) return false;
      if (filters.campaign && act.campaign !== filters.campaign) return false;
      if (filters.fieldId && act.fieldId !== filters.fieldId) return false;
      return true;
    });
  }, [filters]);

  const selectedActivity = useMemo(
    () => MOCK_ACTIVITIES.find((a) => a.id === selectedId) ?? null,
    [selectedId],
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelectedId(null);
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarMobile}
        onMobileClose={() => setSidebarMobile(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarMobile(true)} />
        <div className="flex items-center justify-between px-6 h-14 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-brand-500" />
            <h1 className="text-lg font-semibold text-text-primary">Actividades</h1>
            <span className="text-xs text-text-tertiary">{filtered.length} registros</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-bg-subtle">
              {VIEWS.map((v) => {
                const Icon = v.icon;
                const active = view === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      active ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                );
              })}
            </div>

            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
              <Plus className="size-3.5" />
              Nueva
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-border-default shrink-0">
          <ActivityFilters filters={filters} onChange={setFilters} />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'timeline' && (
            <ActivityTimeline activities={filtered} onSelect={handleSelect} />
          )}
          {view === 'calendar' && (
            <ActivityCalendar activities={filtered} onSelect={handleSelect} />
          )}
          {view === 'table' && (
            <ActivityTable activities={filtered} onSelect={handleSelect} />
          )}
        </div>
      </div>

      {selectedActivity && (
        <ActivitySidebar activity={selectedActivity} onClose={handleCloseSidebar} />
      )}
    </div>
  );
}
