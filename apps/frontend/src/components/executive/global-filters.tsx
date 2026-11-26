'use client';

import { motion } from 'framer-motion';
import { useExecutive } from '@/contexts/executive-context';
import { MOCK_FILTER_OPTIONS } from '@/lib/mock-executive';

export function GlobalFilters() {
  const { filters, setFilter, resetFilters, layout } = useExecutive();

  if (!layout.filtersVisible) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b border-border-default bg-bg-elevated overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
        <select
          value={filters.companyId ?? ''}
          onChange={(e) => setFilter('companyId', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500 max-w-[160px]"
        >
          <option value="">Todas las empresas</option>
          {MOCK_FILTER_OPTIONS.companies.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.farmId ?? ''}
          onChange={(e) => setFilter('farmId', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500 max-w-[160px]"
        >
          <option value="">Todos los establecimientos</option>
          {MOCK_FILTER_OPTIONS.farms.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.fieldId ?? ''}
          onChange={(e) => setFilter('fieldId', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500 max-w-[140px]"
        >
          <option value="">Todos los campos</option>
          {MOCK_FILTER_OPTIONS.fields.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.campaignId ?? ''}
          onChange={(e) => setFilter('campaignId', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500 max-w-[120px]"
        >
          <option value="">Todas las campañas</option>
          {MOCK_FILTER_OPTIONS.campaigns.map((o) => (
            <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.status ?? ''}
          onChange={(e) => setFilter('status', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500 max-w-[130px]"
        >
          <option value="">Todos los estados</option>
          {MOCK_FILTER_OPTIONS.statuses.map((o) => (
            <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.category ?? ''}
          onChange={(e) => setFilter('category', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500 max-w-[130px]"
        >
          <option value="">Todas las categorías</option>
          {MOCK_FILTER_OPTIONS.categories.map((o) => (
            <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.supplierId ?? ''}
          onChange={(e) => setFilter('supplierId', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500 max-w-[150px]"
        >
          <option value="">Todos los proveedores</option>
          {MOCK_FILTER_OPTIONS.suppliers.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => setFilter('dateFrom', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500"
          title="Desde"
        />

        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => setFilter('dateTo', e.target.value || null)}
          className="h-7 rounded-md border border-border-default bg-bg-surface px-2 text-xs text-text-primary outline-none focus:border-brand-500"
          title="Hasta"
        />

        <button
          onClick={resetFilters}
          className="h-7 rounded-md px-2.5 text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors"
        >
          Limpiar
        </button>
      </div>
    </motion.div>
  );
}
