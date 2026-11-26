'use client';

import { Search, X } from 'lucide-react';
import type { ActivityFiltersState, ActivityStatus, ActivityPriority } from '@/types/activities';
import { ACTIVITY_TYPE_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/activities';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data';

interface ActivityFiltersProps {
  filters: ActivityFiltersState;
  onChange: (filters: ActivityFiltersState) => void;
}

export default function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  const hasActiveFilters = filters.search || filters.types.length > 0 || filters.status.length > 0 || filters.campaign || filters.priority.length > 0;

  const clearFilters = () => {
    onChange({ search: '', types: [], status: [], priority: [], campaign: '', fieldId: '', farmName: '', dateRange: ['', ''], responsible: '' });
  };

  const toggleArray = <T,>(arr: T[], val: T) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Buscar actividades..."
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5 min-w-36">
          <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Tipo</label>
          <div className="flex flex-wrap gap-1">
            {Object.values(ACTIVITY_TYPE_CONFIG).map((t) => {
              const active = filters.types.includes(t.code);
              return (
                <button
                  key={t.code}
                  onClick={() => onChange({ ...filters, types: toggleArray(filters.types, t.code) })}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    active ? `${t.bg} ${t.color} ring-1 ring-inset ring-current` : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-subtle'
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5 min-w-36">
          <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Estado</label>
          <div className="flex gap-1">
            {(['pending', 'in_progress', 'completed', 'cancelled'] as ActivityStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const active = filters.status.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => onChange({ ...filters, status: toggleArray(filters.status, s) })}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    active ? `${cfg.bg} ${cfg.color} ring-1 ring-inset ring-current` : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-subtle'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5 min-w-36">
          <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Prioridad</label>
          <div className="flex gap-1">
            {(['low', 'medium', 'high', 'critical'] as ActivityPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const active = filters.priority.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => onChange({ ...filters, priority: toggleArray(filters.priority, p) })}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    active ? `${cfg.bg} ${cfg.color} ring-1 ring-inset ring-current` : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-subtle'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5 min-w-32">
          <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Campaña</label>
          <select
            value={filters.campaign}
            onChange={(e) => onChange({ ...filters, campaign: e.target.value })}
            className="w-full h-8 px-2 rounded-md border border-border-default bg-bg-surface text-xs text-text-primary outline-none"
          >
            <option value="">Todas</option>
            {MOCK_CAMPAIGNS.map((c) => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          <X className="size-3" /> Limpiar filtros
        </button>
      )}
    </div>
  );
}
