'use client';

import { Filter, X } from 'lucide-react';
import type { MapFiltersState } from '../types';
import type { FieldStatus } from '@/types/fields';

interface MapFiltersProps {
  filters: MapFiltersState;
  onChange: (filters: MapFiltersState) => void;
  statuses: FieldStatus[];
  varieties: string[];
  campaigns: string[];
}

export default function MapFilters({
  filters,
  onChange,
  statuses,
  varieties,
  campaigns,
}: MapFiltersProps) {
  const hasActiveFilters =
    filters.status !== 'all' || filters.campaign !== '' || filters.variety !== '';

  const handleClear = () => {
    onChange({
      status: 'all',
      campaign: '',
      variety: '',
      healthRange: [0, 100],
      search: '',
    });
  };

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Filter className="size-3.5" />
          Filtros
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-xs text-text-tertiary hover:text-text-secondary flex items-center gap-1"
          >
            <X className="size-3" />
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-2">
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as FieldStatus | 'all' })}
          className="w-full h-8 px-2 rounded-md border border-border-default bg-bg-surface text-xs text-text-primary outline-none"
        >
          <option value="all">Todos los estados</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === 'active' ? 'Activo' : s === 'inactive' ? 'Inactivo' : s === 'harvesting' ? 'En cosecha' : 'En descanso'}
            </option>
          ))}
        </select>

        <select
          value={filters.campaign}
          onChange={(e) => onChange({ ...filters, campaign: e.target.value })}
          className="w-full h-8 px-2 rounded-md border border-border-default bg-bg-surface text-xs text-text-primary outline-none"
        >
          <option value="">Todas las campañas</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.variety}
          onChange={(e) => onChange({ ...filters, variety: e.target.value })}
          className="w-full h-8 px-2 rounded-md border border-border-default bg-bg-surface text-xs text-text-primary outline-none"
        >
          <option value="">Todas las variedades</option>
          {varieties.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
