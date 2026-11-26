'use client';

import { Search, X } from 'lucide-react';
import type { CostFiltersState, CostCategory } from '@/types/costs';

interface CostFiltersProps {
  filters: CostFiltersState;
  onChange: (filters: CostFiltersState) => void;
  categories: CostCategory[];
}

export function CostFilters({ filters, onChange, categories }: CostFiltersProps) {
  const update = (key: keyof CostFiltersState, value: string) => onChange({ ...filters, [key]: value });

  const hasFilters = filters.search || filters.categoryId || filters.campaignId || filters.status ||
    filters.startDate || filters.endDate || filters.supplierId || filters.fieldId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-text-tertiary" />
        <input
          type="text"
          placeholder="Buscar costos..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="w-full h-8 pl-8 pr-3 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary placeholder:text-text-tertiary"
        />
      </div>

      <select
        value={filters.categoryId}
        onChange={(e) => update('categoryId', e.target.value)}
        className="h-8 px-2.5 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
      >
        <option value="">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        value={filters.campaignId}
        onChange={(e) => update('campaignId', e.target.value)}
        className="h-8 px-2.5 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
      >
        <option value="">Todas las campañas</option>
        <option value="camp-2025-2026">2025/2026</option>
        <option value="camp-2024-2025">2024/2025</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => update('status', e.target.value)}
        className="h-8 px-2.5 text-xs bg-bg-subtle border border-border-default rounded-lg outline-none focus:border-brand-500 text-text-primary"
      >
        <option value="">Todos los estados</option>
        <option value="active">Activo</option>
        <option value="draft">Borrador</option>
        <option value="cancelled">Anulado</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => onChange({
            search: '', companyId: '', farmId: '', fieldId: '', categoryId: '', supplierId: '',
            campaignId: '', status: '', userId: '', startDate: '', endDate: '',
          })}
          className="flex items-center gap-1 h-8 px-2.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X className="size-3" />
          Limpiar
        </button>
      )}
    </div>
  );
}
